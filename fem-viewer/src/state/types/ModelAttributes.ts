export interface WorldArea {
	width: number;
	height: number;
	minWidth: number;
	minHeight: number;
}

export default interface ModelAttributes {
	assetBGColor: string;
	assetGhostBGColor: string;
	assetGroupBGColor: string;

	externalActorBGColor: string;
	externalActorGhostBGColor: string;
	externalActorGroupBGColor: string;

	noteBGColor: string;
	noteGhostBGColor: string;
	noteGroupBGColor: string;

	PoolBGColor: string;
	PoolGhostBGColor: string;
	PoolGroupBGColor: string;

	ProcessBGColor: string;
	ProcessGhostBGColor: string;
	ProcessGroupBGColor: string;

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
