export type BaseInstanceClass =
	| "Process"
	| "Asset"
	| "Pool"
	| "Note"
	| "External Actor";
export type InstanceSubclass =
	| "Process_Subclass"
	| "Asset_Subclass"
	| "External Actor_Subclass";

type InstanceClass = BaseInstanceClass | InstanceSubclass;

export default InstanceClass;
