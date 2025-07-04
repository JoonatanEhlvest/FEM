import { Connector } from "./Connector";
import { Instance } from "./Instance";
import { ModelAttributes } from "./ModelAttributes";

export interface Model {
	id: string;
	applib: string;
	libtype: string;
	modeltype: string;
	name: string;
	version: string;
	connectors: Array<Connector>;
	attributes: Partial<ModelAttributes>;
	instances: Array<Instance>;
}

export function getModelNameWithVersion(model: Model): string {
	return model.version ? `${model.name} ${model.version}` : model.name;
}
