import InstanceClass from "./InstanceClass";
import Reference from "./Reference";

export interface InstancePosition {
	x: number;
	y: number;
	width: number;
	height: number;
	index: number;
}

export default interface Instance {
	id: string;
	name: string;
	class: InstanceClass;
	position: InstancePosition | undefined;
	isGroup: boolean;
	isGhost: boolean;
	applyArchetype: string;
	description: string;
	fontSize: number;
	fontStyle: string;

	individualBGColor: string;
	individualGhostBGColor: string;

	denomination: string,
	referencedDenomination: string;

	// borderColor: string;
	// reference: Reference;
}

const INSTANCE_DEFAULTS: { [key: string]: number | string } = {
	fontsize: 10,
};

export { INSTANCE_DEFAULTS };
