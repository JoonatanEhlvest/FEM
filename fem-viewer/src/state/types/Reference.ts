import InstanceClass from "./InstanceClass";

export default interface Reference {
	type: string;
	modelName: string;
	class: InstanceClass;
	referencedInstanceName: string;
}
