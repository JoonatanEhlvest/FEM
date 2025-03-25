import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { addXMLAttrPrefix, ATTR_PREFIX } from "./utils";
import { Connector } from "@fem-viewer/types";
import {
	Instance,
	ColorPicker,
	INSTANCE_DEFAULTS,
	BorderColorPicker,
} from "@fem-viewer/types/Instance";
import { InstanceClass } from "@fem-viewer/types";
import { Model } from "@fem-viewer/types";
import { ModelAttributes } from "@fem-viewer/types";
import { XMLObj } from "./types";
import { Interrefs } from "@fem-viewer/types/Instance";

// Import from baseParser.ts
import { parseXMLToModel } from "./baseParser";

// Import from editor.ts
import { XMLEditor, createXMLEditor } from "./editor";

class Parser {
	_parsedXML: any;

	constructor(XMLData: any) {
		this._parsedXML = XMLData;
		this._flatten();
	}

	/**
	 * Remove whitespace and anything between brackets
	 * Some attributes are in the form "Process Background Color (Process Background Color Hex Color)"
	 * So to use them as object keys they need to be changed
	 * @param s input string to normalize
	 * @returns santized string
	 */
	_normalize(s: string): string {
		return s.replace(/((\s)+)|(\(.*\))/g, "").toLowerCase();
	}

	_flattenAttributes(toFlatten: any): any {
		const flattened: any = {};
		const attributes = toFlatten.ATTRIBUTE;
		const nameAttr = addXMLAttrPrefix("name");
		if (Array.isArray(attributes)) {
			attributes.forEach((attr: any) => {
				const normalizedName = this._normalize(attr[nameAttr]);
				flattened[normalizedName] = attr;
				delete flattened[normalizedName][nameAttr];
			});
		} else if (typeof attributes === "object") {
			const normalizedName = this._normalize(attributes[nameAttr]);
			flattened[normalizedName] = attributes;
			delete flattened[normalizedName][nameAttr];
		}
		return flattened;
	}

	_getAttrWithFallback = (model: any, attr: any, fallBack: any): any => {
		if (model[attr] === undefined) {
			return fallBack;
		}
		return model[attr];
	};

	_getArrAttrWithFallback = (model: any, attr: any, fallBack: any): any => {
		if (model[attr] === undefined) {
			return fallBack;
		}
		if (Array.isArray(model[attr])) {
			return model[attr];
		}

		return Array(model[attr]);
	};

	_flatten() {
		if (!Array.isArray(this._parsedXML.ADOXML.MODELS.MODEL)) {
			this._parsedXML.ADOXML.MODELS.MODEL = Array(
				this._parsedXML.ADOXML.MODELS.MODEL
			);
		}
		this._parsedXML.ADOXML.MODELS.MODEL =
			this._parsedXML.ADOXML.MODELS.MODEL.map((model: any) => {
				return {
					...model,
					MODELATTRIBUTES: this._flattenAttributes(
						model.MODELATTRIBUTES
					),
					INSTANCE: this._getArrAttrWithFallback(
						model,
						"INSTANCE",
						[]
					).map((instance: any) => {
						return {
							...instance,
							ATTRIBUTE: this._flattenAttributes(instance),
						};
					}),

					CONNECTOR: this._getArrAttrWithFallback(
						model,
						"CONNECTOR",
						[]
					).map((connector: any) => {
						return {
							...connector,
							ATTRIBUTE: this._flattenAttributes(connector),
						};
					}),
				};
			});
	}

	getModels(): any {
		const models = this._parsedXML.ADOXML.MODELS.MODEL;
		return models;
	}

	getModelAttrs(XML: any): any {
		const names: { [key: string]: number } = {};
		this._parsedXML.ADOXML.MODELS.MODEL.forEach((element: any) => {
			const attrs = element.MODELATTRIBUTES.ATTRIBUTE;
			attrs.forEach((attr: any) => {
				const name = attr[addXMLAttrPrefix("name")];
				if (names[name]) {
					names[name] += 1;
				} else {
					names[name] = 1;
				}
			});
		});
		return names;
	}

	tryGetStrProperty(jsonObj: XMLObj, attr: string): string {
		const attrWithPrefix = addXMLAttrPrefix(attr);
		if (jsonObj !== undefined && jsonObj[attrWithPrefix] !== undefined) {
			const value = jsonObj[attrWithPrefix];
			return String(value);
		} else {
			return "";
		}
	}

	hasTextProperty(value: XMLObj[keyof XMLObj]): boolean {
		return (
			value !== undefined &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			value["#text"] !== undefined
		);
	}

	tryGetBoolAttr(XMLattribute: XMLObj, attr: string): boolean {
		const value = XMLattribute[attr];
		if (this.hasTextProperty(value)) {
			return (value as XMLObj)["#text"] === "Yes" ? true : false;
		} else {
			return false;
		}
	}

	tryGetStrAttr(XMLattribute: XMLObj, attr: string): string {
		const value = XMLattribute[attr];
		if (this.hasTextProperty(value)) {
			return (value as XMLObj)["#text"] as string;
		} else {
			return "";
		}
	}

	tryGetNumAttr(XMLattribute: XMLObj, attr: string): number {
		const value = XMLattribute[attr];
		if (this.hasTextProperty(value)) {
			return Number((value as XMLObj)["#text"]);
		} else {
			return INSTANCE_DEFAULTS.hasOwnProperty(attr)
				? Number(INSTANCE_DEFAULTS[attr])
				: 0;
		}
	}

	findFloatsFromString(s: string): number[] | undefined {
		return s.match(/[+-]?([0-9]*[.])?[0-9]+/g)?.map((f) => parseFloat(f));
	}

	parseInstancePosition(s: string): Instance["position"] {
		const match = this.findFloatsFromString(s);
		if (match === undefined) {
			return undefined;
		}
		const ret: Instance["position"] = {
			x: match[0],
			y: match[1],
			width: match[2],
			height: match[3],
			index: match[4],
		};

		return ret;
	}

	parseWorldArea(s: string): ModelAttributes["worldArea"] {
		const match = this.findFloatsFromString(s);
		if (match === undefined) {
			return undefined;
		}

		const ret: ModelAttributes["worldArea"] = {
			width: match[0],
			height: match[1],
			minWidth: match[2],
			minHeight: match[3],
		};

		return ret;
	}

	extractHexColor(s: string): string {
		const pattern = /val:"(\$?[a-zA-Z0-9]+)"/;
		const match = s.match(pattern);

		if (match == null || match.length < 2) {
			return "";
		}
		return match[1];
	}

	parseInterref(interref: XMLObj[]) {
		const res: any = {};

		interref.forEach((ref) => {
			if (ref["name"] !== undefined) {
				res[ref["name"] as string] = ref["IREF"];
			}
		});
		return res;
	}

	getInstances(
		instances: Array<XMLObj>,
		modelName: Model["name"]
	): Array<Instance> {
		const ret: Array<Instance> = instances.map((XMLInstance) => {
			const attributes = XMLInstance.ATTRIBUTE as XMLObj;
			const position = this.parseInstancePosition(
				this.tryGetStrAttr(attributes, "position")
			);

			const id = this.tryGetStrProperty(XMLInstance, "id");
			const name = this.tryGetStrProperty(XMLInstance, "name");

			const interrefs = this.parseInterref(
				XMLInstance.INTERREF as XMLObj[]
			);

			const instance: Instance = {
				id,
				class: this.tryGetStrProperty(
					XMLInstance,
					"class"
				) as InstanceClass,
				name,
				isGhost: this.tryGetBoolAttr(attributes, "isghost"),
				isGroup: this.tryGetBoolAttr(attributes, "isgroup"),
				position: position,
				applyArchetype: this.tryGetStrAttr(
					attributes,
					"applyArchetype"
				),
				description: this.tryGetStrAttr(attributes, "description"),
				fontSize: this.tryGetNumAttr(attributes, "fontsize"),
				fontStyle: this.tryGetStrAttr(attributes, "fontStyle"),
				individualBGColor: this.tryGetStrAttr(
					attributes,
					"individualbackgroundcolor"
				),
				individualGhostBGColor: this.tryGetStrAttr(
					attributes,
					"individualghostbackgroundcolor"
				),
				referencedBGColor: this.extractHexColor(
					this.tryGetStrAttr(attributes, "referencedcolor")
				),
				referencedGhostBGColor: this.extractHexColor(
					this.tryGetStrAttr(attributes, "referencedghostcolor")
				),
				denomination: this.tryGetStrAttr(attributes, "denomination"),
				referencedDenomination: this.tryGetStrAttr(
					attributes,
					"referenceddenomination"
				),
				colorPicker: this.tryGetStrAttr(
					attributes,
					"colorpicker"
				) as ColorPicker,
				borderColor: this.tryGetStrAttr(attributes, "bordercolor"),
				borderColorPicker: this.tryGetStrAttr(
					attributes,
					"bordercolorpicker"
				) as BorderColorPicker,
				Interrefs: interrefs,
			};

			return instance;
		});

		return ret;
	}

	getConnectors(connectors: Array<XMLObj>): Array<Connector> {
		const ret: Array<Connector> = connectors.map((XMLconnector) => {
			const attributes = XMLconnector.ATTRIBUTE as XMLObj;
			const from = XMLconnector.FROM as XMLObj;
			const to = XMLconnector.TO as XMLObj;
			const connector: Connector = {
				id: this.tryGetStrProperty(XMLconnector, "id"),
				class: this.tryGetStrProperty(XMLconnector, "class"),
				fromId: this.tryGetStrProperty(from, "instance"),
				toId: this.tryGetStrProperty(to, "instance"),
				positions: this.tryGetStrAttr(attributes, "positions"),
				appearance: this.tryGetStrAttr(attributes, "appearance"),
				processType: this.tryGetStrAttr(attributes, "processtype"),
			};
			return connector;
		});
		return ret;
	}

	getModelAttributes(modelAttributes: XMLObj): Partial<ModelAttributes> {
		const f = (s: string): string => this.tryGetStrAttr(modelAttributes, s);

		const worldArea = this.parseWorldArea(f("worldarea"));
		const ret: Partial<ModelAttributes> = {
			accessState: f("accessstate"),
			colors: {
				Asset: {
					ghost: f("assetghostbackgroundcolor"),
					group: f("assetgroupbackgroundcolor"),
					default: f("assetbackgroundcolor"),
				},
				Pool: {
					ghost: f("poolghostbackgroundcolor"),
					group: f("poolgroupbackgroundcolor"),
					default: f("poolbackgroundcolor"),
				},
				Process: {
					ghost: f("processghostbackgroundcolor"),
					group: f("processgroupbackgroundcolor"),
					default: f("processbackgroundcolor"),
				},
				Note: {
					ghost: f("noteghostbackgroundcolor"),
					group: f("notegroupbackgroundcolor"),
					default: f("notebackgroundcolor"),
				},
				"External Actor": {
					ghost: f("externalactorghostbackgroundcolor"),
					group: f("externalactorgroupbackgroundcolor"),
					default: f("externalactorbackgroundcolor"),
				},
			},

			Author: f("author"),
			baseName: f("basename"),
			name: f("name"),
			changeCounter: this.tryGetNumAttr(modelAttributes, "changecounter"),
			comment: f("comment"),
			connectorMarks: f("connectormarks"),
			contextOfVersion: f("contextofversion"),
			creationDate: f("creationdate"),
			currentMode: f("currentmode"),
			currentPageLayout: f("currentpagelayout"),
			lastChanged: f("datelastchanged"),
			description: f("description"),
			externalActorBGColor: f("externalactorbackgroundcolor"),
			externalActorGhostBGColor: f("externalactorghostbackgroundcolor"),
			externalActorGroupBGColor: f("externalactorgroupbackgroundcolor"),
			fontSize: this.tryGetNumAttr(modelAttributes, "fontsize"),
			lastUser: f("lastuser"),
			modelType: f("modeltype"),
			noteBGColor: f("notebackgroundcolor"),
			noteGhostBGColor: f("noteghostbackgroundcolor"),
			noteGroupBGColor: f("notegroupbackgroundcolor"),

			position: f("position"),
			state: f("state"),
			type: f("type"),
			worldArea: worldArea,
			viewableArea: f("viewablearea"),
			zoom: this.tryGetNumAttr(modelAttributes, "zoom"),
		};

		return ret;
	}

	parseModel(model: any) {
		const attributes = this.getModelAttributes(model.MODELATTRIBUTES);
		let name = attributes.name;
		if (!name || name === "") {
			name = this.tryGetStrProperty(model, "name");
		}
		const parsedModel: Model = {
			name,
			id: this.tryGetStrProperty(model, "id"),
			applib: this.tryGetStrProperty(model, "applib"),
			modeltype: this.tryGetStrProperty(model, "modeltype"),
			version: this.tryGetStrProperty(model, "version"),
			libtype: this.tryGetStrProperty(model, "libtype"),
			connectors: this.getConnectors(model.CONNECTOR),
			instances: this.getInstances(model.INSTANCE, name),
			attributes,
		};
		return parsedModel;
	}

	parseModels() {
		return this.getModels().map((model: any) => {
			return this.parseModel(model);
		});
	}
}

const createParser = (XMLData: any): Parser => {
	const jObj = parseXMLToModel(XMLData);
	return new Parser(jObj);
};

export default createParser;

export { Parser };

// Re export utils
export { addXMLAttrPrefix, ATTR_PREFIX };

// Re export baseParser and doctypeParser
export { parseXMLToModel, buildXMLFromParsed } from "./baseParser";
export {
	parseXMLToModelPreserveDoctype,
	buildXMLFromParsedPreserveDoctype,
} from "./doctypeParser";

// Export XMLEditor
export { XMLEditor, createXMLEditor };
