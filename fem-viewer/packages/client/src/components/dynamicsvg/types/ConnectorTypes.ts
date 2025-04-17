/**
 * Geometric types for connector calculations in canvas space (pixels)
 */

/**
 * Represents a point in canvas space (pixels on the SVG canvas)
 */
export interface CanvasPoint {
	x: number;
	y: number;
}

/**
 * Represents a rectangle in canvas space (pixels on the SVG canvas)
 *
 * @property x - The x-coordinate of the top-left corner of the rectangle in pixels
 * @property y - The y-coordinate of the top-left corner of the rectangle in pixels
 * @property width - The width of the rectangle in pixels
 * @property height - The height of the rectangle in pixels
 */
export interface CanvasRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Represents a line segment between two points in canvas space
 *
 * @property from - The starting point of the segment
 * @property to - The ending point of the segment
 */
export interface Segment {
	from: CanvasPoint;
	to: CanvasPoint;
}

/**
 * Represents an intersection point between a line and a geometric shape (typically a rectangle).
 * Used for calculating where connector lines intersect with instance boundaries.
 *
 * @property t - Parameter value along the line (0 = start, 1 = end, values in between represent points along the segment)
 * @property point - The actual intersection point in canvas coordinates
 */
export interface Intersection {
	t: number;
	point: CanvasPoint;
}

/**
 * Type definitions for connector display properties
 */
export interface ConnectorDisplayStyle {
	stroke: string;
	strokeWidth: number;
	strokeDasharray?: string;
	opacity?: number;
	filter?: string;
	fill?: string;
}

export interface ConnectorDisplayProperties {
	defaultStyle: ConnectorDisplayStyle;
	labelStyle?: {
		fontSize: number;
		fill: string;
		opacity: number;
	};
	arrowStyle?: {
		width?: number; // Controls the arrow size (optional)
		height?: number; // Controls the arrow height (optional)
		visible?: boolean; // Whether to show the arrow (defaults to true)
	};
}

/**
 * Holds calculated direction information for a connector segment.
 *
 * @property startPoint - The starting point of the segment
 * @property nextPoint - The ending point of the segment
 * @property dx - Change in x from start to end point
 * @property dy - Change in y from start to end point
 * @property angleRad - Angle of the segment in radians
 * @property angleDeg - Angle of the segment in degrees
 * @property length - Length of the segment
 * @property unitX - Normalized x component of the direction vector (dx/length)
 * @property unitY - Normalized y component of the direction vector (dy/length)
 */
export interface ConnectorDirectionInfo {
	startPoint: CanvasPoint;
	nextPoint: CanvasPoint;
	dx: number;
	dy: number;
	angleRad: number;
	angleDeg: number;
	length: number;
	unitX: number;
	unitY: number;
}
