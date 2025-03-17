import { parseXMLToModel, buildXMLFromParsed } from './baseParser';

/**
 * Specialized version of parseXMLToModel that preserves DOCTYPE declarations
 * @param XMLData The XML data to parse
 * @param preserveOrder Whether to preserve the order of elements
 * @returns The parsed XML object with DOCTYPE preserved
 */
export const parseXMLToModelPreserveDoctype = (
	XMLData: any,
	preserveOrder: boolean = false
): any => {
	// Extract DOCTYPE before parsing
	const doctypeMatch = XMLData.match(/<!DOCTYPE\s+[^>]+>/i);
	const doctype = doctypeMatch ? doctypeMatch[0] : null;

	// Use the standard parser
	const jObj = parseXMLToModel(XMLData, preserveOrder);
	
	// Store DOCTYPE in the parsed object for later use
	if (doctype) {
		// Store the DOCTYPE in a special property that won't interfere with the expected structure
		if (!jObj.ADOXML) {
			// If the expected structure doesn't exist, create a minimal valid structure
			// to prevent errors in the _flatten method
			jObj.ADOXML = {
				MODELS: {
					MODEL: []
				}
			};
		}
		
		// Store the DOCTYPE in a special property
		jObj.ADOXML['#doctype'] = doctype;
	}
	
	return jObj;
};

/**
 * Specialized version of buildXMLFromParsed that preserves DOCTYPE declarations
 * @param parsedXML The parsed XML object
 * @param format Whether to format the XML output for better readability
 * @returns The XML string with DOCTYPE preserved
 */
export const buildXMLFromParsedPreserveDoctype = (
	parsedXML: any,
	format: boolean = true
): string => {
	// Check if we have stored DOCTYPE
	let doctype = null;
	let parsedXMLCopy = JSON.parse(JSON.stringify(parsedXML)); // Deep copy to avoid modifying the original
	
	// Extract the DOCTYPE from our special property
	if (parsedXMLCopy.ADOXML && parsedXMLCopy.ADOXML['#doctype']) {
		doctype = parsedXMLCopy.ADOXML['#doctype'];
		// Remove our custom doctype entry
		delete parsedXMLCopy.ADOXML['#doctype'];
	}

	// Use the standard builder
	let result = buildXMLFromParsed(parsedXMLCopy, format);
	
	// Insert DOCTYPE after XML declaration if it exists
	if (doctype) {
		const xmlDeclEnd = result.indexOf('?>');
		if (xmlDeclEnd > 0) {
			// xmlDeclEnd + 2 is the position of the first character after '?>' in the XML declaration
			result = result.substring(0, xmlDeclEnd + 2) + '\n' + doctype + '\n' + result.substring(xmlDeclEnd + 2);
		} else {
			// If there is no XML declaration, insert the DOCTYPE as the first line of the XML
			result = doctype + '\n' + result;
		}
	}
	
	return result;
};