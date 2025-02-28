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

export type InstanceClass = BaseInstanceClass | InstanceSubclass;
