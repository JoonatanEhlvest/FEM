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

// Connector class types
export type ConnectorClass =
	| "Used In"
	| "Manages"
	| "relates-to"
	| "Association"
	| "Inspects/Monitors"
	| "Drawing/Adding"
	| "Is inside";

/**
 * Base interface with common properties for all connectors
 */
export interface BaseConnector {
	id: string;
	fromName: string; // Instance name
	toName: string; // Instance name
	positions: ConnectorPositions;
	class: ConnectorClass;
}

export type AssetConnectorType =
	| "Beneficiary"
	| "Workforce"
	| "Partner"
	| "EXT"
	| "Tech & Info Infrastructure"
	| "Stock"
	| "Org. Infrastructure"
	| "Means of Payment"
	| "Attraction";
/**
 * Used In connector - represents resource flows
 */
export interface UsedInConnector extends BaseConnector {
	class: "Used In";
	isTransitive: boolean;
	appearance: "Default" | "Highlighted";
	assetTypes: AssetConnectorType[];
}

export type ProcessConnectorType = "Acquire" | "Maintain" | "Retire";

/**
 * Manages connector - represents management relationships
 */
export interface ManagesConnector extends BaseConnector {
	class: "Manages";
	processTypes: ProcessConnectorType[];
	isTransitive: boolean;
	appearance: "Default" | "Highlighted";
	labelType: "Text" | "Symbol";
}

/**
 * Relates-to connector - represents relations between objects
 */
export interface RelatesToConnector extends BaseConnector {
	class: "relates-to";
	appearance: "Default" | "Important" | "Very Important";
}

/**
 * Association connector - represents associations between objects
 */
export interface AssociationConnector extends BaseConnector {
	class: "Association";
	direction: "Unidirectional" | "Symmetric";
	orientation: "Horizontal" | "Vertical";
	note: string;
}

/**
 * Inspects/Monitors connector - represents inspection relationships
 */
export interface InspectsMonitorsConnector extends BaseConnector {
	class: "Inspects/Monitors";
	orientation: "Horizontal" | "Vertical";
	note: string;
}

/**
 * Drawing/Adding connector - represents visual connectors for drawing
 */
export interface DrawingAddingConnector extends BaseConnector {
	class: "Drawing/Adding";
	thickness: number;
	thick: string;
	note: string;
	orientation: "Horizontal" | "Vertical";
}

/**
 * Is inside connector - represents a containment relationship
 */
export interface IsInsideConnector extends BaseConnector {
	class: "Is inside";
}

export type Connector =
	| UsedInConnector
	| ManagesConnector
	| RelatesToConnector
	| AssociationConnector
	| InspectsMonitorsConnector
	| DrawingAddingConnector
	| IsInsideConnector;

/**
 * Type guards for connector types
 */

/**
 * Checks if the connector is a Used In connector
 */
export function isUsedInConnector(
	connector: Connector
): connector is UsedInConnector {
	return connector.class === "Used In";
}

/**
 * Checks if the connector is a Manages connector
 */
export function isManagesConnector(
	connector: Connector
): connector is ManagesConnector {
	return connector.class === "Manages";
}

/**
 * Checks if the connector is a relates-to connector
 */
export function isRelatesToConnector(
	connector: Connector
): connector is RelatesToConnector {
	return connector.class === "relates-to";
}

/**
 * Checks if the connector is an Association connector
 */
export function isAssociationConnector(
	connector: Connector
): connector is AssociationConnector {
	return connector.class === "Association";
}

/**
 * Checks if the connector is an Inspects/Monitors connector
 */
export function isInspectsMonitorsConnector(
	connector: Connector
): connector is InspectsMonitorsConnector {
	return connector.class === "Inspects/Monitors";
}

/**
 * Checks if the connector is a Drawing/Adding connector
 */
export function isDrawingAddingConnector(
	connector: Connector
): connector is DrawingAddingConnector {
	return connector.class === "Drawing/Adding";
}

/**
 * Checks if the connector is an Is inside connector
 */
export function isIsInsideConnector(
	connector: Connector
): connector is IsInsideConnector {
	return connector.class === "Is inside";
}
