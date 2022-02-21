import Instance from "./Instance";

export default interface Connector {
	id: string;
	class: string;
	fromId: Instance["id"];
	toId: Instance["id"];
	positions: string;
	appearance: string;
	processType: string;
}
