export default interface Connector {
	id: string;
	class: string;
	fromId: string;
	toId: string;
	positions: string;
	appearance: string;
	type: string;
}
