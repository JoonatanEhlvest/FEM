import { XMLParser } from "fast-xml-parser";
import { addXMLAttrPrefix, ATTR_PREFIX } from "../utlitity";

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

	_flatten() {
		this._parsedXML.ADOXML.MODELS.MODEL =
			this._parsedXML.ADOXML.MODELS.MODEL.map((model: any) => {
				return {
					...model,
					MODELATTRIBUTES: this._flattenAttributes(
						model.MODELATTRIBUTES
					),
					INSTANCE: this._getAttrWithFallback(
						model,
						"INSTANCE",
						[]
					).map((instance: any) => {
						return {
							...instance,
							ATTRIBUTE: this._flattenAttributes(instance),
						};
					}),

					CONNECTOR: this._getAttrWithFallback(
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
}

const createParser = (XMLData: any): Parser => {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: ATTR_PREFIX,
	};
	const parser = new XMLParser(options);

	const xml: string = XMLData;
	const jObj = parser.parse(xml);
	return new Parser(jObj);
};

export default createParser;
