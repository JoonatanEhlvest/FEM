import { Instance } from "./Instance";

/**
 * Represents an absolute position from the top left corner of the model canvas.
 *
 * @property x - The x coordinate in cm
 * @property y - The y coordinate in cm
 */
export interface ConnectorPoint {
	x: number;
	y: number;
}

/**
 * Represents the positions of a connector on the model canvas.
 *
 * @property pathPoints - Array of points defining the path, ordered from start to end.
 * @property middlePoint - Optional label point from XML.
 * @property edgeCount - Number of edge points. (same as pathPoints.length)
 * @property index
 */
export interface ConnectorPositions {
	pathPoints: ConnectorPoint[];
	middlePoint?: ConnectorPoint;
	edgeCount: number;
	index: number;
}

/**
 * Represents a connector in the model.
 *
 * @property id - The unique identifier for the connector.
 * @property class - The class of the connector (e.g. "Used In", "Manages").
 * @property fromId - The name of the instance that the connector starts from.
 * @property toId - The name of the instance that the connector ends at.
 * @property positions - The positions that define the connector path.
 * @property appearance - The appearance of the connector.
 * @property processTypes - Array of process types (e.g. "Acquire", "Maintain") when the connector goes from Process to Asset.
 * @property assetTypes - Array of asset types (e.g. "Tech & Info Infrastructure", "Partner") when the connector goes from Asset to Process.
 */
export interface Connector {
	id: string;
	class: string;
	fromId: string; // Instance name (not ID)
	toId: string; // Instance name (not ID)
	positions: ConnectorPositions;
	appearance: string;
	processTypes: string[];
	assetTypes: string[];
}
