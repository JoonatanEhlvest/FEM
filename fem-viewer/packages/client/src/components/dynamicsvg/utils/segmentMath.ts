import { Segment } from "../types/ConnectorTypes";

export interface CanvasPoint {
	x: number;
	y: number;
}

export interface CanvasRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface Intersection {
	t: number;
	point: CanvasPoint;
}

/**
 * Calculates the delta (change) between two points
 */
export function getSegmentDelta(segment: Segment): { dx: number; dy: number } {
	return {
		dx: segment.to.x - segment.from.x,
		dy: segment.to.y - segment.from.y,
	};
}

/**
 * Calculates the length of a segment
 */
export function getSegmentLength(segment: Segment): number {
	const { dx, dy } = getSegmentDelta(segment);
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a value is effectively zero (less than half a pixel)
 */
export function isCloseToZero(value: number): boolean {
	return Math.abs(value) < 0.0001;
}

/**
 * Calculates unit vector components for a segment
 */
export function getSegmentUnitVector(segment: Segment): {
	unitX: number;
	unitY: number;
} {
	const { dx, dy } = getSegmentDelta(segment);
	const length = getSegmentLength(segment);

	// Handle zero length case to avoid division by zero
	if (isCloseToZero(length)) {
		return { unitX: 0, unitY: 0 };
	}

	return {
		unitX: dx / length,
		unitY: dy / length,
	};
}

/**
 * Calculates direction information for a given segment
 */
export function getSegmentDirectionInfo(segment: Segment): {
	startPoint: { x: number; y: number };
	nextPoint: { x: number; y: number };
	dx: number;
	dy: number;
	angleRad: number;
	angleDeg: number;
	length: number;
	unitX: number;
	unitY: number;
} {
	const { dx, dy } = getSegmentDelta(segment);
	const length = getSegmentLength(segment);
	const angleRad = Math.atan2(dy, dx);
	const angleDeg = (angleRad * 180) / Math.PI;
	const { unitX, unitY } = getSegmentUnitVector(segment);

	return {
		startPoint: segment.from,
		nextPoint: segment.to,
		dx,
		dy,
		angleRad,
		angleDeg,
		length,
		unitX,
		unitY,
	};
}

/**
 * Calculates a perpendicular offset for a segment
 */
export function getPerpendicularOffset(
	segment: Segment,
	offsetAmount: number
): { perpX: number; perpY: number } {
	const { unitX, unitY } = getSegmentUnitVector(segment);
	return {
		perpX: -unitY * offsetAmount,
		perpY: unitX * offsetAmount,
	};
}

/**
 * Calculates a position along a segment at a given distance
 */
export function getOffsetPositionAlongSegment(
	segment: Segment,
	distance: number
): { x: number; y: number } {
	const { unitX, unitY } = getSegmentUnitVector(segment);
	return {
		x: segment.from.x + unitX * distance,
		y: segment.from.y + unitY * distance,
	};
}

/**
 * Creates offset segments for parallel lines
 */
export function createOffsetSegments(
	segments: Segment[],
	offset: number,
	isUpper: boolean
): Segment[] {
	const perpFactor = isUpper ? 1 : -1;

	return segments.map((segment) => {
		const { perpX, perpY } = getPerpendicularOffset(
			segment,
			offset * perpFactor
		);

		return {
			from: {
				x: segment.from.x + perpX,
				y: segment.from.y + perpY,
			},
			to: {
				x: segment.to.x + perpX,
				y: segment.to.y + perpY,
			},
		};
	});
}
