import { Instance } from "./Instance";
import { InstanceClass } from "./InstanceClass";
import { Model } from "./Model";

export interface Reference {
	type: string;
	modelName: Model["name"];
	referencedInstanceName: Instance["name"];
	referencedClass: InstanceClass;
	referencedByInstance: Instance["name"];
	referencedByModel: Model["name"];
}
