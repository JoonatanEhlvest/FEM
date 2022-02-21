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

	individualBGColor: string;
	individualGhostBGColor: string;

	// borderColor: string;
	// reference: Reference;
}

const INSTANCE_DEFAULTS: { [key: string]: number | string } = {
	fontsize: 10,
};

export { INSTANCE_DEFAULTS };
