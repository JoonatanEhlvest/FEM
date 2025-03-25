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

export type InstanceClass = BaseInstanceClass | InstanceSubclass;

/**
 * Maps an instance subclass to its base class.
 * Assumes that InstanceSubclass ends with "_Subclass" and that BaseInstanceClass exists for the given InstanceSubclass
 * 
 * @param instanceClass - The instance class to get the base class for
 * @returns The base class of the instance class, or the original class if it's already a base class
 */
export function getBaseInstanceClass(instanceClass: InstanceClass): BaseInstanceClass {
	if (instanceClass.includes('_Subclass')) {
	  // Extract the base class from the subclass name (e.g., "Asset_Subclass" -> "Asset")
	  const baseClassName = instanceClass.split('_')[0] as BaseInstanceClass;
	  return baseClassName;
	}
	
	// If it's already a base class, return it directly
	return instanceClass as BaseInstanceClass;
  }
