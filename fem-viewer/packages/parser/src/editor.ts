import { parseXMLToModel, buildXMLFromParsed } from "./baseParser";
import {
	parseXMLToModelPreserveDoctype,
	buildXMLFromParsedPreserveDoctype,
} from "./doctypeParser";
import {
	Instance,
	ColorPicker,
	BorderColorPicker,
	InterrefType,
	Iref,
} from "@fem-viewer/types/Instance";

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
			debug: options.debug ?? false,
		};

		// Parse the XML data with or without DOCTYPE preservation
		if (this._options.preserveDoctype) {
			this._parsedXML = parseXMLToModelPreserveDoctype(xmlData, false);
		} else {
			this._parsedXML = parseXMLToModel(xmlData, false);
		}

		if (this._options.debug) {
			console.log("Initial instance IDs:", this.getAllInstanceIds());
		}
	}

	/**
	 * Updates an instance attribute in the XML
	 * @param instanceId The ID of the instance to update
	 * @param attributeName The name of the attribute to update
	 * @param attributeValue The new value for the attribute
	 * @returns The result of the edit operation
	 */
	updateInstanceAttribute(
		instanceId: string,
		attributeName: string,
		attributeValue: string
	): EditResult {
		return this._updateInstanceProperty(
			instanceId,
			"ATTRIBUTE",
			attributeName,
			attributeValue
		);
	}

	/**
	 * Updates an instance interref in the XML
	 * @param instanceId The ID of the instance to update
	 * @param interrefName The name of the interref to update
	 * @param iref The new value for the interref
	 * @returns The result of the edit operation
	 */
	updateInstanceInterref(
		instanceId: string,
		interrefName: InterrefType,
		iref: Iref
	): EditResult {
		return this._updateInstanceProperty(
			instanceId,
			"INTERREF",
			interrefName,
			iref
		);
	}

	/**
	 * Updates an instance description in the XML
	 * @param instanceId The ID of the instance to update
	 * @param description The new description
	 * @returns The result of the edit operation
	 */
	updateInstanceDescription(
		instanceId: string,
		description: string
	): EditResult {
		return this.updateInstanceAttribute(
			instanceId,
			"Description",
			description
		);
	}

	/**
	 * Updates an instance color picker in the XML
	 * @param instanceId The ID of the instance to update
	 * @param colorPicker The new color picker (Default, Individual or Subclass)
	 * @returns The result of the edit operation
	 */
	updateInstanceColorPicker(
		instanceId: string,
		colorPicker: ColorPicker
	): EditResult {
		return this.updateInstanceAttribute(
			instanceId,
			"Color Picker",
			colorPicker
		);
	}

	/**
	 * Updates an instance border color picker in the XML
	 * @param instanceId The ID of the instance to update
	 * @param borderColorPicker The new border color picker (Individual or Subclass)
	 * @returns The result of the edit operation
	 */
	updateInstanceBorderColorPicker(
		instanceId: string,
		borderColorPicker: BorderColorPicker
	): EditResult {
		return this.updateInstanceAttribute(
			instanceId,
			"Border Color Picker",
			borderColorPicker
		);
	}

	/**
	 * Updates an instance referenced background color in the XML
	 * @param instanceId The ID of the instance to update
	 * @param color The new referenced background color
	 * @returns The result of the edit operation
	 */
	updateInstanceReferencedBGColor(
		instanceId: string,
		color: string
	): EditResult {
		return this.updateInstanceExpressionAttributeValue(
			instanceId,
			"referencedColor",
			color
		);
	}

	/**
	 * Updates an instance referenced ghost background color in the XML
	 * @param instanceId The ID of the instance to update
	 * @param color The new referenced ghost background color
	 * @returns The result of the edit operation
	 */
	updateInstanceReferencedGhostBGColor(
		instanceId: string,
		color: string
	): EditResult {
		return this.updateInstanceExpressionAttributeValue(
			instanceId,
			"referencedGhostColor",
			color
		);
	}

	/**
	 * Updates an instance attribute of type EXPRESSION in the XML
	 * to a simple value expression (EXPR val:"attributeValue")
	 * @param instanceId The ID of the instance to update
	 * @param attributeName The name of the attribute to update
	 * @param attributeValue The new value for the attribute
	 * @returns The result of the edit operation
	 */
	updateInstanceExpressionAttributeValue(
		instanceId: string,
		attributeName: string,
		attributeValue: string
	): EditResult {
		return this._updateInstanceProperty(
			instanceId,
			"ATTRIBUTE",
			attributeName,
			attributeValue,
			(value) => `EXPR val:"${value}"`
		);
	}

	/**
	 * Updates an instance subclass in the XML
	 * @param instanceId The ID of the instance to update
	 * @param iref The full Iref object with subclass information
	 * @returns The result of the edit operation
	 */
	updateInstanceSubclass(instanceId: string, iref: Iref): EditResult {
		return this.updateInstanceInterref(
			instanceId,
			"Referenced Subclass" as InterrefType,
			iref
		);
	}

	/**
	 * Updates an instance referenced BSubclass in the XML
	 * @param instanceId The ID of the instance to update
	 * @param iref The full Iref object with BSubclass information
	 * @returns The result of the edit operation
	 */
	updateInstanceBSubclass(instanceId: string, iref: Iref): EditResult {
		return this.updateInstanceInterref(
			instanceId,
			"Referenced Bsubclass" as InterrefType,
			iref
		);
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
			console.log(
				"Building XML from:",
				JSON.stringify(this._parsedXML).substring(0, 200) + "..."
			);
		}

		// Build the XML using the appropriate builder
		let result;
		if (this._options.preserveDoctype) {
			result = buildXMLFromParsedPreserveDoctype(
				this._parsedXML,
				this._options.formatOutput
			);
		} else {
			result = buildXMLFromParsed(
				this._parsedXML,
				this._options.formatOutput
			);
		}

		// Log a sample of the result
		if (this._options.debug) {
			console.log(
				"Built XML (sample):",
				result.substring(0, 200) + "..."
			);
		}

		return result;
	}

	/**
	 * Core method to update instance properties with consistent error handling and XML rebuilding
	 * @param instanceId The ID of the instance to update
	 * @param propertyType The type of property to update (ATTRIBUTE or INTERREF)
	 * @param propertyName The name of the property to update
	 * @param propertyValue The new value for the property
	 * @param valueFormatter Function to format the value before setting it
	 * @returns The result of the edit operation
	 */
	private _updateInstanceProperty<T>(
		instanceId: string,
		propertyType: "ATTRIBUTE" | "INTERREF",
		propertyName: string,
		propertyValue: T,
		valueFormatter: (value: T) => string = (value: any) => value
	): EditResult {
		try {
			// Find the instance in the parsed structure
			const instance = this.findInstanceById(instanceId);

			if (!instance) {
				return {
					success: false,
					error: `Instance with ID '${instanceId}' not found`,
				};
			}

			// Ensure property array exists and is an array
			if (!instance[propertyType]) {
				instance[propertyType] = [];
			} else if (!Array.isArray(instance[propertyType])) {
				// Convert to array if it's a single object
				instance[propertyType] = [instance[propertyType]];
			}

			const properties = instance[propertyType];
			let propertyFound = false;

			// Update existing property
			for (const prop of properties) {
				if (prop.name === propertyName) {
					if (propertyType === "INTERREF") {
						// For interrefs, set the IREF property
						prop.IREF = propertyValue;
					} else {
						// For attributes, set the #text property with formatted value
						prop["#text"] = valueFormatter(propertyValue);
					}
					propertyFound = true;

					if (this._options.debug) {
						console.log(
							`Updated ${propertyType.toLowerCase()} ${propertyName} to ${
								typeof propertyValue === "object"
									? JSON.stringify(propertyValue)
									: propertyValue
							}`
						);
					}
					break;
				}
			}

			// Return error if property not found
			if (!propertyFound) {
				return {
					success: false,
					error: `${propertyType} '${propertyName}' not found in instance '${instanceId}'`,
				};
			}

			// Rebuild the XML
			const xml = this.buildXML();

			return {
				success: true,
				xml,
			};
		} catch (error: any) {
			return {
				success: false,
				error: `Error updating instance ${propertyType.toLowerCase()}: ${
					error.message || "Unknown error"
				}`,
			};
		}
	}
}

/**
 * Creates a new XMLEditor instance
 * @param xmlData The XML data to edit
 * @param options Options for the editor
 * @returns A new XMLEditor instance
 */
export const createXMLEditor = (
	xmlData: string,
	options: XMLEditorOptions = {}
): XMLEditor => {
	return new XMLEditor(xmlData, options);
};

export default createXMLEditor;
