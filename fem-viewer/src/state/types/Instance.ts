import InstanceClass from "./InstanceClass";
import Reference from "./Reference";

export interface InstancePosition {
	x: number;
	y: number;
	width: number;
	height: number;
	index: number;
}

export type ColorPicker = "Default" | "Individual" | "Subclass";

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

	referencedBGColor: string;
	referencedGhostBGColor: string;

	denomination: string;
	referencedDenomination: string;
	colorPicker: ColorPicker;

	borderColor: string;
	reference: Reference | null;
}

const INSTANCE_DEFAULTS: { [key: string]: number | string } = {
	fontsize: 10,
};

const isSubclass = (i: Instance): boolean => {
	const subclasses: InstanceClass[] = ["Asset_Subclass", "Process_Subclass"];
	return subclasses.includes(i.class);
};

export { INSTANCE_DEFAULTS, isSubclass };
