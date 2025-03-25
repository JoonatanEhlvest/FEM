import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { addXMLAttrPrefix, ATTR_PREFIX } from "./utils";

/**
 * Parses XML data into a JavaScript object
 * @param XMLData The XML data to parse
 * @param preserveOrder Whether to preserve the order of elements
 * @returns The parsed XML object
 */
export const parseXMLToModel = (
	XMLData: any,
	preserveOrder: boolean = false
): any => {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: ATTR_PREFIX,
		preserveOrder,
		commentPropName: "#comment",
		isArray: (name: string) => {
			// Ensure these elements are always treated as arrays (simplifies parsing)
			return [
				"MODEL",
				"INSTANCE",
				"CONNECTOR",
				"ATTRIBUTE",
				"INTERREF",
			].includes(name);
		},
	};
	const parser = new XMLParser(options);

	const xml: string = XMLData;
	const jObj = parser.parse(xml);
	return jObj;
};

/**
 * Converts a parsed XML object back to an XML string
 * @param parsedXML The parsed XML object
 * @param format Whether to format the XML output for better readability
 * @returns The XML string
 */
export const buildXMLFromParsed = (
	parsedXML: any,
	format: boolean = true
): string => {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: ATTR_PREFIX,
		format,
		preserveOrder: false,
		commentPropName: "#comment",
		suppressEmptyNode: false,
		suppressBooleanAttributes: false,
	};

	const builder = new XMLBuilder(options);
	return builder.build(parsedXML);
};
