import Connector from "./Connector";
import Instance from "./Instance";
import ModelAttributes from "./ModelAttributes";

export default interface Model {
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
