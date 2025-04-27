import {
	ProcessClass,
	AssetClass,
	ExternalActorClass,
	PoolClass,
	NoteClass,
	InstanceSubclass,
	BorderSubclass,
} from "./InstanceClass";
import { ProcessIcon, AssetIcon, ArtefactSubtypeIcon } from "./Icons";

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

// Base interface with common properties
export interface BaseInstance {
	id: string;
	name: string;
	position: InstancePosition;
	isGroup: boolean;
	isGhost: boolean;
	applyArchetype: string;
	description: string;
	fontSize: number;
	fontStyle: string;

	// Individual colors
	individualBGColor: string;
	individualGhostBGColor: string;
	borderColor: string;

	// Referenced colors
	referencedBGColor: string;
	referencedGhostBGColor: string;
	referencedBorderColor: string;

	// Class-specific colors
	classBackgroundColor: string;
	classGhostBackgroundColor: string;
	classGroupBackgroundColor?: string;

	// Display properties
	denomination: string;
	referencedDenomination: string;
	colorPicker: ColorPicker;
	borderColorPicker: BorderColorPicker;

	Interrefs: Interrefs;
}

// Class-specific interfaces
export interface ProcessInstance extends BaseInstance {
	class: ProcessClass;
	isPrimaryProcess: boolean;
	isStakeholderAcquireProcess: boolean;
	isSubprocessesGroup: boolean;
	icon?: ProcessIcon;
}

export interface AssetInstance extends BaseInstance {
	class: AssetClass;
	isMeansOfPayment: boolean;
	isMonetaryFund: boolean;
	isAttractionOutgoing: boolean;
	isTacit: boolean;
	numberOfUnits: number;
	unitName: string;
	icon?: AssetIcon;
	iconForArtefact?: ArtefactSubtypeIcon;
}

export interface ExternalActorInstance extends BaseInstance {
	class: ExternalActorClass;
	isMultiple: boolean;
}

export interface PoolInstance extends BaseInstance {
	class: PoolClass;
}

export interface NoteInstance extends BaseInstance {
	class: NoteClass;
}

// Union type of all specific instances
export type Instance =
	| ProcessInstance
	| AssetInstance
	| ExternalActorInstance
	| PoolInstance
	| NoteInstance;

// Type guards - simplified to use the imported types
export function isProcessInstance(
	instance: Instance
): instance is ProcessInstance {
	const processClasses: ProcessClass[] = [
		"Process",
		"Process_Subclass",
		"Process_Border_Subclass",
	];
	return processClasses.includes(instance.class as ProcessClass);
}

export function isAssetInstance(instance: Instance): instance is AssetInstance {
	const assetClasses: AssetClass[] = [
		"Asset",
		"Asset_Subclass",
		"Asset_Border_Subclass",
	];
	return assetClasses.includes(instance.class as AssetClass);
}

export function isExternalActorInstance(
	instance: Instance
): instance is ExternalActorInstance {
	const externalActorClasses: ExternalActorClass[] = [
		"External Actor",
		"External Actor_Subclass",
		"External Actor_Border_Subclass",
	];
	return externalActorClasses.includes(instance.class as ExternalActorClass);
}

export function isPoolInstance(instance: Instance): instance is PoolInstance {
	const poolClasses: PoolClass[] = [
		"Pool",
		"Pool_Subclass",
		"Pool_Border_Subclass",
	];
	return poolClasses.includes(instance.class as PoolClass);
}

export function isNoteInstance(instance: Instance): instance is NoteInstance {
	const noteClasses: NoteClass[] = [
		"Note",
		"Note_Subclass",
		"Note_Border_Subclass",
	];
	return noteClasses.includes(instance.class as NoteClass);
}

export const INSTANCE_DEFAULTS: { [key: string]: number | string } = {
	fontsize: 10,
};

export function isSubclass(
	i: Instance
): i is Instance & { class: InstanceSubclass } {
	const subclasses: InstanceSubclass[] = [
		"Asset_Subclass",
		"Process_Subclass",
		"External Actor_Subclass",
		"Pool_Subclass",
		"Note_Subclass",
	];
	return subclasses.includes(i.class as InstanceSubclass);
}

export function isBorderSubclass(
	i: Instance
): i is Instance & { class: BorderSubclass } {
	const borderSubclasses: BorderSubclass[] = [
		"Asset_Border_Subclass",
		"Process_Border_Subclass",
		"External Actor_Border_Subclass",
		"Pool_Border_Subclass",
		"Note_Border_Subclass",
	];
	return borderSubclasses.includes(i.class as BorderSubclass);
}
