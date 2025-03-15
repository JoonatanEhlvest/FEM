import { createXMLEditor } from '@fem-viewer/parser';
import fs from 'fs';
import path from 'path';

describe('XMLEditor Tests', () => {
  // Create temp directory if it doesn't exist
  const tempDir = path.resolve(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  test('Update instance description', async () => {
    // Load a real XML file
    const xmlFilePath = path.resolve(__dirname, '../fixtures/gym-example.xml');
    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
    
    // Create an editor with debug mode enabled
    const editor = createXMLEditor(xmlData, { 
      preserveDoctype: true,
      debug: true 
    });
    
    // Get all instance IDs for debugging
    const allIds = editor.getAllInstanceIds();
    console.log('Available instance IDs:', allIds.slice(0, 5));
    
    // Make sure we have at least one instance ID
    expect(allIds.length).toBeGreaterThan(0);
    
    // Use the first available ID
    const instanceId = allIds[0];
    console.log('Using instance ID:', instanceId);
    
    // Update the description
    const newDescription = 'This is a test description';
    const result = editor.updateInstanceDescription(instanceId, newDescription);
    
    // Log debug information
    console.log('Update result:', {
      success: result.success,
      error: result.error,
      debug: result.debug
    });
    
    // Write the updated XML to a file for inspection
    if (result.success && result.xml) {
      fs.writeFileSync(path.resolve(tempDir, 'updated-description.xml'), result.xml);
      
      // Verify the update was successful
      expect(result.success).toBe(true);
      expect(result.xml).toBeDefined();
      expect(result.xml).toContain('<!DOCTYPE');
      
      // Check if the instance IDs are preserved in the debug info
      if (result.debug) {
        console.log('Before IDs count:', result.debug.beforeIds.length);
        console.log('After IDs count:', result.debug.afterIds.length);
        
        expect(result.debug.beforeIds.length).toBeGreaterThan(0);
        expect(result.debug.afterIds.length).toBeGreaterThan(0);
        expect(result.debug.afterIds).toContain(instanceId);
      }
      
      // Create a new editor with the updated XML to verify the changes
      const updatedEditor = createXMLEditor(result.xml, { preserveDoctype: true });
      const updatedInstance = updatedEditor.findInstanceById(instanceId);
      
      // Verify the instance exists and has the updated description
      expect(updatedInstance).not.toBeNull();
      
      if (updatedInstance) {
        const attributes = updatedInstance.ATTRIBUTE || [];
        const attributeArray = Array.isArray(attributes) ? attributes : [attributes];
        
        const descriptionAttr = attributeArray.find((attr: any) => attr.name === 'Description');
        expect(descriptionAttr).toBeDefined();
        expect(descriptionAttr['#text']).toBe(newDescription);
      }
    } else {
      // If the update failed, the test should fail
      fail(`Failed to update instance description: ${result.error}`);
    }
  });

  test('Update non-existent instance', async () => {
    // Load a real XML file
    const xmlFilePath = path.resolve(__dirname, '../fixtures/gym-example.xml');
    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
    
    // Create an editor
    const editor = createXMLEditor(xmlData, { preserveDoctype: true });
    
    // Try to update a non-existent instance
    const result = editor.updateInstanceDescription('non-existent-id', 'This should fail');
    
    // Verify the update failed
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
}); 