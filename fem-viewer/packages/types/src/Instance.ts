import { InstanceClass } from "./InstanceClass";

/**
 * Position and dimensions of an instance in the model.
 * Note on coordinate system:
 * - For most instances (except Notes), x,y coordinates represent the center point
 * - For Notes, x,y coordinates represent the top-left corner
 */
export interface InstancePosition {
	/**
	 * For most instances (except Notes), x represents the center point.
	 * For Notes, x represents the top-left corner.
	 */
	x: number;
	/**
	 * For most instances (except Notes), y represents the center point.
	 * For Notes, y represents the top-left corner.
	 */
	y: number;
	width: number;
	height: number;
	index: number;
}

export type ColorPicker = "Default" | "Individual" | "Subclass";
export type BorderColorPicker = "Individual" | "Subclass";

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
	position: InstancePosition;
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
	referencedBorderColor: string;
	borderColorPicker: BorderColorPicker;
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
		"Pool_Subclass",
		"Note_Subclass",
	];
	return subclasses.includes(i.class);
};

export const isBorderSubclass = (i: Instance): boolean => {
	const borderSubclasses: InstanceClass[] = [
		"Asset_Border_Subclass",
		"Process_Border_Subclass",
		"External Actor_Border_Subclass",
		"Pool_Border_Subclass",
		"Note_Border_Subclass",
	];
	return borderSubclasses.includes(i.class);
};
