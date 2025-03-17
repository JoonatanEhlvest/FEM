import { parseXMLToModel, buildXMLFromParsed } from './baseParser';
import { parseXMLToModelPreserveDoctype, buildXMLFromParsedPreserveDoctype } from './doctypeParser';
import { Instance } from '@fem-viewer/types';
import { addXMLAttrPrefix, ATTR_PREFIX } from './utils';

/**
 * Options for the XMLEditor
 */
export interface XMLEditorOptions {
  /** Whether to preserve DOCTYPE declarations */
  preserveDoctype?: boolean;
  /** Whether to format the XML output */
  formatOutput?: boolean;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Result of an edit operation
 */
export interface EditResult {
  /** Whether the edit was successful */
  success: boolean;
  /** The edited XML string if successful */
  xml?: string;
  /** Error message if the edit failed */
  error?: string;
  /** Debug information */
  debug?: any;
}

/**
 * Class for editing XML instances while preserving the original structure
 */
export class XMLEditor {
  private _parsedXML: any;
  private _options: XMLEditorOptions;

  /**
   * Creates a new XMLEditor instance
   * @param xmlData The XML data to edit
   * @param options Options for the editor
   */
  constructor(xmlData: string, options: XMLEditorOptions = {}) {
    this._options = {
      preserveDoctype: options.preserveDoctype ?? true,
      formatOutput: options.formatOutput ?? true,
      debug: options.debug ?? false
    };

    // Parse the XML data with or without DOCTYPE preservation
    if (this._options.preserveDoctype) {
      this._parsedXML = parseXMLToModelPreserveDoctype(xmlData, false);
    } else {
      this._parsedXML = parseXMLToModel(xmlData, false);
    }
    
    if (this._options.debug) {
      console.log('Initial instance IDs:', this.getAllInstanceIds());
    }
  }

  /**
   * Updates an instance attribute in the XML
   * @param instanceId The ID of the instance to update
   * @param attributeName The name of the attribute to update
   * @param attributeValue The new value for the attribute
   * @returns The result of the edit operation
   */
  updateInstanceAttribute(instanceId: string, attributeName: string, attributeValue: string): EditResult {
    try {
      // Find the instance in the parsed structure
      const instance = this.findInstanceById(instanceId);
      
      if (!instance) {
        return {
          success: false,
          error: `Instance with ID '${instanceId}' not found`
        };
      }
      
      // Find the attribute in the instance
      const attributes = instance.ATTRIBUTE || [];
      let attributeFound = false;
      
      for (const attr of attributes) {
        if (attr.name === attributeName) {
          // Update the attribute value
          attr["#text"] = attributeValue;
          attributeFound = true;
          break;
        }
      }
      
      if (!attributeFound) {
        return {
          success: false,
          error: `Attribute '${attributeName}' not found in instance '${instanceId}'`
        };
      }
      
      if (this._options.debug) {
        console.log('Before buildXML, instance IDs:', this.getAllInstanceIds());
      }
      
      // Rebuild the XML
      const xml = this.buildXML();
      
      // For debugging, parse the XML again and check if instance IDs are preserved
      if (this._options.debug) {
        const debugEditor = createXMLEditor(xml, { 
          preserveDoctype: this._options.preserveDoctype,
          debug: this._options.debug
        });
        console.log('After buildXML, instance IDs:', debugEditor.getAllInstanceIds());
      }
      
      return {
        success: true,
        xml,
        debug: this._options.debug ? {
          beforeIds: this.getAllInstanceIds(),
          afterIds: createXMLEditor(xml, { 
            preserveDoctype: this._options.preserveDoctype,
            debug: false
          }).getAllInstanceIds()
        } : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Error updating instance attribute: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Updates an instance description in the XML
   * @param instanceId The ID of the instance to update
   * @param description The new description
   * @returns The result of the edit operation
   */
  updateInstanceDescription(instanceId: string, description: string): EditResult {
    return this.updateInstanceAttribute(instanceId, "Description", description);
  }

  /**
   * Finds an instance by ID
   * @param instanceId The ID of the instance to find
   * @returns The instance object or null if not found
   */
  findInstanceById(instanceId: string): any {
    if (!this._parsedXML.ADOXML || !this._parsedXML.ADOXML.MODELS) {
      return null;
    }
    
    const models = this._parsedXML.ADOXML.MODELS.MODEL;
    
    for (const model of models) {
      if (!model.INSTANCE) continue;
      
      for (const instance of model.INSTANCE) {
        if (instance.id === instanceId) {
          return instance;
        }
      }
    }
    
    return null;
  }

  /**
   * Gets all instance IDs in the XML
   * @returns Array of instance IDs
   */
  getAllInstanceIds(): string[] {
    const ids: string[] = [];
    
    if (!this._parsedXML.ADOXML || !this._parsedXML.ADOXML.MODELS) {
      return ids;
    }
    
    // Assumes that MODELS is an array
    const models = this._parsedXML.ADOXML.MODELS.MODEL;
    
    for (const model of models) {
      if (!model.INSTANCE) continue;
      
      for (const instance of model.INSTANCE) {
        if (instance.id) {
          ids.push(instance.id);
        }
      }
    }
    
    return ids;
  }

  /**
   * Validates the XML structure
   * @returns Whether the XML structure is valid
   */
  validateXML(): boolean {
    try {
      // Basic validation - check if required structures exist
      if (!this._parsedXML.ADOXML || !this._parsedXML.ADOXML.MODELS) {
        return false;
      }
      
      //TODO: Validate the XML structure using the xml to Model parser
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Builds XML from the parsed data
   * @returns The XML string
   */
  buildXML(): string {
    // Log the structure before building XML
    if (this._options.debug) {
      console.log('Building XML from:', JSON.stringify(this._parsedXML).substring(0, 200) + '...');
    }
    
    // Build the XML using the appropriate builder
    let result;
    if (this._options.preserveDoctype) {
      result = buildXMLFromParsedPreserveDoctype(this._parsedXML, this._options.formatOutput);
    } else {
      result = buildXMLFromParsed(this._parsedXML, this._options.formatOutput);
    }
    
    // Log a sample of the result
    if (this._options.debug) {
      console.log('Built XML (sample):', result.substring(0, 200) + '...');
    }
    
    return result;
  }
}

/**
 * Creates a new XMLEditor instance
 * @param xmlData The XML data to edit
 * @param options Options for the editor
 * @returns A new XMLEditor instance
 */
export const createXMLEditor = (xmlData: string, options: XMLEditorOptions = {}): XMLEditor => {
  return new XMLEditor(xmlData, options);
};

export default createXMLEditor;
