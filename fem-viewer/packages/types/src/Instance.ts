import { InstanceClass } from "./InstanceClass";

export interface InstancePosition {
	x: number;
	y: number;
	width: number;
	height: number;
	index: number;
}

export type ColorPicker = "Default" | "Individual" | "Subclass";

export interface Iref {
	type: string;
	tmodeltype: string;
	tmodelname: string;
	tmodelver: string;
	tclassname: string;
	tobjname: string;
}

export type InterrefType =
	| "referencedProcess"
	| "referencedAsset"
	| "referencedNote"
	| "Referenced Pool"
	| "Referenced External Actor"
	| "Referenced Subclass"
	| "Referenced Bsubclass";

export type Interrefs = {
	[key in InterrefType]: Iref | undefined;
};

export interface Instance {
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
	Interrefs: Interrefs;
}

export const INSTANCE_DEFAULTS: { [key: string]: number | string } = {
	fontsize: 10,
};

export const isSubclass = (i: Instance): boolean => {
	const subclasses: InstanceClass[] = [
		"Asset_Subclass",
		"Process_Subclass",
		"External Actor_Subclass",
	];
	return subclasses.includes(i.class);
};
