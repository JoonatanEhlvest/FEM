import { BaseInstanceClass } from "./InstanceClass";

export interface WorldArea {
	width: number;
	height: number;
	minWidth: number;
	minHeight: number;
}

export type ModelAttributeColors = {
	[key in BaseInstanceClass]: {
		[key in "ghost" | "group" | "default"]: string;
	};
};

export interface ModelAttributes {
	colors: ModelAttributeColors;

	// TODO: move these into ModelAttributeColors
	externalActorBGColor: string;
	externalActorGhostBGColor: string;
	externalActorGroupBGColor: string;

	// TODO: move these into ModelAttributeColors
	noteBGColor: string;
	noteGhostBGColor: string;
	noteGroupBGColor: string;

	accessState: string;
	Author: string;
	name: string;
	baseName: string;
	changeCounter: number;
	comment: string;
	connectorMarks: string;
	contextOfVersion: string;
	creationDate: string;
	currentMode: string;
	currentPageLayout: string;
	lastChanged: string;
	description: string;
	fontSize: number;
	lastUser: string;
	modelType: string;
	position: string;
	state: string;
	type: string;
	zoom: number;
	worldArea: WorldArea | undefined;
	viewableArea: string;
}
