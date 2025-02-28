export const ATTR_PREFIX = "";

export const addXMLAttrPrefix = (s: string): string => {
	return `${ATTR_PREFIX}${s}`;
};