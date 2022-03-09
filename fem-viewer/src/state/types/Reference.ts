import Instance from "./Instance";
import Model from "./Model";

export default interface Reference {
	type: string;
	modelName: Model["name"];
	referencedInstanceName: Instance["name"];
}
