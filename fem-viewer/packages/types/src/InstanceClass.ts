export type BaseInstanceClass =
	| "Process"
	| "Asset"
	| "Pool"
	| "Note"
	| "External Actor";
export type InstanceSubclass =
	| "Process_Subclass"
	| "Asset_Subclass"
	| "External Actor_Subclass"
	| "Pool_Subclass"
	| "Note_Subclass";
export type BorderSubclass =
	| "Process_Border_Subclass"
	| "Asset_Border_Subclass"
	| "External Actor_Border_Subclass"
	| "Pool_Border_Subclass"
	| "Note_Border_Subclass";

// Specific class types
export type ProcessClass =
	| "Process"
	| "Process_Subclass"
	| "Process_Border_Subclass";
export type AssetClass = "Asset" | "Asset_Subclass" | "Asset_Border_Subclass";
export type ExternalActorClass =
	| "External Actor"
	| "External Actor_Subclass"
	| "External Actor_Border_Subclass";
export type PoolClass = "Pool" | "Pool_Subclass" | "Pool_Border_Subclass";
export type NoteClass = "Note" | "Note_Subclass" | "Note_Border_Subclass";

export type InstanceClass =
	| BaseInstanceClass
	| InstanceSubclass
	| BorderSubclass;

/**
 * Maps an instance subclass or border subclass to its base class.
 * Assumes that InstanceSubclass or BorderSubclass ends with "_Subclass" or "_Border_Subclass" and that BaseInstanceClass exists for the given InstanceSubclass or BorderSubclass
 *
 * @param instanceClass - The instance class to get the base class for
 * @returns The base class of the instance class, or the original class if it's already a base class
 */
export function getBaseInstanceClass(
	instanceClass: InstanceClass
): BaseInstanceClass {
	if (instanceClass.includes("_Subclass")) {
		// Extract the base class from the subclass or border subclass name (e.g., "Asset_Subclass" -> "Asset")
		const baseClassName = instanceClass.split("_")[0] as BaseInstanceClass;
		return baseClassName;
	}

	// If it's already a base class, return it directly
	return instanceClass as BaseInstanceClass;
}

/**
 * Maps an instance class to its subclass type.
 * Assumes that InstanceClass ends with "_Subclass" and that InstanceSubclass exists for the given InstanceClass
 *
 * @param instanceClass - The instance class to get the subclass type for
 * @returns The instance subclass type of the instance class
 */
export function getSubclassTypeFromBaseInstanceClass(
	instanceClass: BaseInstanceClass
): InstanceSubclass {
	const subclass = instanceClass + "_Subclass";
	return subclass as InstanceSubclass;
}

/**
 * Maps an instance class to its border subclass type.
 * Assumes that InstanceClass ends with "_Border_Subclass" and that BorderSubclass exists for the given InstanceClass
 *
 * @param instanceClass - The instance class to get the border subclass type for
 * @returns The border subclass type of the instance class
 */
export function getBorderSubclassTypeFromBaseInstanceClass(
	instanceClass: BaseInstanceClass
): BorderSubclass {
	const subclass = instanceClass + "_Border_Subclass";
	return subclass as BorderSubclass;
}
