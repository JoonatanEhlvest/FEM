import InstanceClass from "./InstanceClass";
import Reference from "./Reference";

export default interface Instance {
	id: string;
	name: string;
	class: InstanceClass;
	position: string;
	isGroup: boolean;
	isGhost: boolean;
	applyArchetype: string;
	description: string;
	fontSize: number;
	fontStyle: string;

	borderColor: string;
	individualBGColor: string;
	individualGhostBGColor: string;
	reference: Reference;
}
