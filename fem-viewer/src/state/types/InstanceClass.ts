export type BaseInstanceClass = "Process" | "Asset" | "Pool" | "Note";
export type InstanceSubclass = "Process_Subclass" | "Asset_Subclass";

type InstanceClass = BaseInstanceClass | InstanceSubclass;

export default InstanceClass;
