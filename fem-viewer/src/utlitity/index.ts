const ATTR_PREFIX = "";

const addXMLAttrPrefix = (s: string): string => {
	return `${ATTR_PREFIX}${s}`;
};

export { ATTR_PREFIX, addXMLAttrPrefix };
