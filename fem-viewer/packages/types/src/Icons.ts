/**
 * Enum for Process icon types (keys are filenames, values are the full descriptive names)
 */
export enum ProcessIcon {
	transformation = "transformation",
	transportation = "transportation of entities from one place to another",
	acquisition = "acquisition from the outer world, e.g. recruiting, purchasing, adopting",
	development = "development of own addition to asset",
}

/**
 * Enum for Asset icon types (keys are filenames, values are the full descriptive names)
 */
export enum AssetIcon {
	people = "people",
	organization = "organization",
	orgstructure = "orgstructure e.g. departments",
	artefact = "artefact",
	money = "money or similar",
}

/**
 * Enum for Artefact subtypes (keys are filenames, values are the full descriptive names)
 */
export enum ArtefactSubtypeIcon {
	building = "building or office",
	tool = "tool or equipment",
	transport = "transport means",
	computer = "computer equipment e.g. server, desktop, network",
	network = "network",
	software = "software system",
	infostore = "infostore e.g. a database",
	information = "information or data",
	text = "text e.g. document, book, manual",
	contract = "contract or agreement",
	material = "material or parts - physical stuff",
}

/**
 * Creates a union type of all string literal values (not keys) from the icon enums
 */
export type IconValue = ProcessIcon | AssetIcon | ArtefactSubtypeIcon;

/**
 * Type representing all possible icon keys (filenames)
 */
export type IconKey =
	| keyof typeof ProcessIcon
	| keyof typeof AssetIcon
	| keyof typeof ArtefactSubtypeIcon;

/**
 * Find the key (filename) for a given icon value
 */
export function getKeyFromValue(value: IconValue): IconKey | undefined {
	// Check process icons
	for (const key in ProcessIcon) {
		if (ProcessIcon[key as keyof typeof ProcessIcon] === value) {
			return key as keyof typeof ProcessIcon;
		}
	}

	// Check asset icons
	for (const key in AssetIcon) {
		if (AssetIcon[key as keyof typeof AssetIcon] === value) {
			return key as keyof typeof AssetIcon;
		}
	}

	// Check artefact subtypes
	for (const key in ArtefactSubtypeIcon) {
		if (
			ArtefactSubtypeIcon[key as keyof typeof ArtefactSubtypeIcon] ===
			value
		) {
			return key as keyof typeof ArtefactSubtypeIcon;
		}
	}

	return undefined;
}
