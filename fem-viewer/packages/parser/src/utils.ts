/**
 * Utility functions for the parser package
 */

/**
 * Prefix for XML attributes
 */
export const ATTR_PREFIX = '@_';

/**
 * Add the XML attribute prefix to a string
 * @param str The string to add the prefix to
 * @returns The string with the prefix
 */
export function addXMLAttrPrefix(str: string): string {
  return `${ATTR_PREFIX}${str}`;
}

/**
 * Remove whitespace and anything between brackets
 * Some attributes are in the form "Process Background Color (Process Background Color Hex Color)"
 * So to use them as object keys they need to be changed
 * @param s input string to normalize
 * @returns sanitized string
 */
export function normalize(s: string): string {
  return s.replace(/((\s)+)|(\(.*\))/g, '').toLowerCase();
}

/**
 * Extract a hex color from a string
 * @param s The string to extract the hex color from
 * @returns The extracted hex color
 */
export function extractHexColor(s: string): string {
  const pattern = /val:"(\$?[a-zA-Z0-9]+)"/;
  const match = s.match(pattern);

  if (match == null || match.length < 2) {
    return '';
  }
  return match[1];
}

/**
 * Find floats in a string
 * @param s The string to find floats in
 * @returns An array of floats
 */
export function findFloatsFromString(s: string): number[] | undefined {
  return s.match(/[+-]?([0-9]*[.])?[0-9]+/g)?.map((f) => parseFloat(f));
} 