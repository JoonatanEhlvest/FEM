/**
 * @fem-viewer/parser
 * 
 * This file exports the Parser class for parsing XML data into FEM models.
 */

import { XMLParser } from 'fast-xml-parser';
import type { 
  Model, 
  Instance, 
  Connector, 
  ModelAttributes,
  ModelAttributeColors
} from '@fem-viewer/types';
import { ATTR_PREFIX, addXMLAttrPrefix, normalize, extractHexColor, findFloatsFromString } from './utils';

/**
 * XML object type
 */
export interface XMLObj {
  [key: string]: string | number | boolean | XMLObj | XMLObj[];
}

/**
 * Parser class for converting XML data to FEM models
 */
export class Parser {
  private _parsedXML: any;

  /**
   * Create a new Parser instance
   * @param XMLData The XML data to parse
   */
  constructor(XMLData: string) {
    this._parsedXML = this.parseXMLToModel(XMLData);
    this._flatten();
  }

  /**
   * Parse XML data to a model object
   * @param XMLData The XML data to parse
   * @param preserveOrder Whether to preserve the order of elements
   * @returns The parsed XML object
   */
  private parseXMLToModel(XMLData: string, preserveOrder: boolean = false): any {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: ATTR_PREFIX,
      preserveOrder,
    };
    const parser = new XMLParser(options);
    return parser.parse(XMLData);
  }

  /**
   * Flatten the parsed XML data
   */
  private _flatten(): void {
    // Implementation details would go here
    // This is a placeholder for the actual implementation
  }

  /**
   * Get all models from the parsed XML
   * @returns An array of models
   */
  public getModels(): Model[] {
    // Implementation details would go here
    // This is a placeholder for the actual implementation
    return [];
  }

  /**
   * Parse the XML data into models
   * @returns An array of parsed models
   */
  public parseModels(): Model[] {
    return this.getModels().map((model: any) => {
      return this.parseModel(model);
    });
  }

  /**
   * Parse a single model
   * @param model The model to parse
   * @returns The parsed model
   */
  private parseModel(model: any): Model {
    // Implementation details would go here
    // This is a placeholder for the actual implementation
    return {
      id: '',
      name: '',
      instances: [],
      connectors: [],
      attributes: {
        name: '',
        description: '',
        Author: '',
        baseName: '',
        changeCounter: 0,
        comment: '',
        connectorMarks: '',
        contextOfVersion: '',
        creationDate: '',
        currentMode: '',
        currentPageLayout: '',
        lastChanged: '',
        lastUser: '',
        modelType: '',
        position: '',
        state: '',
        type: '',
        viewableArea: '',
        zoom: 0,
        accessState: '',
        colors: {} as ModelAttributeColors
      }
    };
  }
}

/**
 * Create a new Parser instance
 * @param XMLData The XML data to parse
 * @returns A new Parser instance
 */
export function createParser(XMLData: string): Parser {
  return new Parser(XMLData);
}

/**
 * Parse XML data to a model object
 * @param XMLData The XML data to parse
 * @param preserveOrder Whether to preserve the order of elements
 * @returns The parsed XML object
 */
export function parseXMLToModel(XMLData: string, preserveOrder: boolean = false): any {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: ATTR_PREFIX,
    preserveOrder,
  };
  const parser = new XMLParser(options);
  return parser.parse(XMLData);
}

export { ATTR_PREFIX, addXMLAttrPrefix, normalize, extractHexColor, findFloatsFromString };
export default createParser; 