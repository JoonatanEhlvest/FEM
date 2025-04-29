import { CanvasPoint, CanvasRect, Intersection } from "../types/ConnectorTypes";
import { isCloseToZero } from "./segmentMath";

/**
 * Checks if a point is inside a rectangle
 */
export function isPointInsideRect(
	point: CanvasPoint,
	rect: CanvasRect
): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

/**
 * Calculates intersection with a vertical edge of the rectangle.
 *
 * The line is defined parametrically as:
 * x = p1.x + t * dx
 * y = p1.y + t * dy
 *
 * For a vertical edge at x-coordinate 'x':
 * t = (x - p1.x) / dx
 *
 * Then we check if the corresponding y-coordinate is within the rectangle's height.
 *
 * @param p1 - Starting point of the line
 * @param dx - Change in x from p1 to p2
 * @param dy - Change in y from p1 to p2
 * @param x - The x-coordinate of the vertical edge to check
 * @param rect - The rectangle to check intersection with
 * @returns The intersection point and its parameter t, or null if no valid intersection
 */
export function findVerticalEdgeIntersection(
	p1: CanvasPoint,
	dx: number,
	dy: number,
	x: number,
	rect: CanvasRect
): Intersection | null {
	// Calculate t where the line intersects the vertical edge
	const t = (x - p1.x) / dx;

	// Only consider intersections in the forward direction from p1
	if (t >= 0) {
		// Calculate the y-coordinate at this intersection
		const y = p1.y + t * dy;

		// Check if the y-coordinate is within the rectangle's height
		if (y >= rect.y && y <= rect.y + rect.height) {
			return { t, point: { x, y } };
		}
	}
	return null;
}

/**
 * Calculates intersection with a horizontal edge of the rectangle.
 *
 * The line is defined parametrically as:
 * x = p1.x + t * dx
 * y = p1.y + t * dy
 *
 * For a horizontal edge at y-coordinate 'y':
 * t = (y - p1.y) / dy
 *
 * Then we check if the corresponding x-coordinate is within the rectangle's width.
 *
 * @param p1 - Starting point of the line
 * @param dx - Change in x from p1 to p2
 * @param dy - Change in y from p1 to p2
 * @param y - The y-coordinate of the horizontal edge to check
 * @param rect - The rectangle to check intersection with
 * @returns The intersection point and its parameter t, or null if no valid intersection
 */
export function findHorizontalEdgeIntersection(
	p1: CanvasPoint,
	dx: number,
	dy: number,
	y: number,
	rect: CanvasRect
): Intersection | null {
	// Calculate t where the line intersects the horizontal edge
	const t = (y - p1.y) / dy;

	// Only consider intersections in the forward direction from p1
	if (t >= 0) {
		// Calculate the x-coordinate at this intersection
		const x = p1.x + t * dx;

		// Check if the x-coordinate is within the rectangle's width
		if (x >= rect.x && x <= rect.x + rect.width) {
			return { t, point: { x, y } };
		}
	}
	return null;
}

/**
 * Finds the intersection point between a line segment and a rectangle's border.
 * The function will find the intersection closest to the outside point.
 *
 * @param outsidePoint - A point outside the rectangle
 * @param insidePoint - A point inside the rectangle
 * @param rect - The rectangle to find intersection with
 * @returns The intersection point on the rectangle's border
 * @throws Error if both points are inside or outside the rectangle
 */
export function findBorderIntersection(
	outsidePoint: CanvasPoint,
	insidePoint: CanvasPoint,
	rect: CanvasRect
): CanvasPoint | undefined {
	const dx = insidePoint.x - outsidePoint.x;
	const dy = insidePoint.y - outsidePoint.y;

	const outsidePointInside = isPointInsideRect(outsidePoint, rect);
	const insidePointInside = isPointInsideRect(insidePoint, rect);

	// If both points are inside, this is an invalid case
	if (outsidePointInside && insidePointInside) {
		return undefined;
	}

	// If points are in wrong order, swap them
	if (outsidePointInside && !insidePointInside) {
		return findBorderIntersection(insidePoint, outsidePoint, rect);
	}

	// If both points are outside, this is an invalid case
	if (!outsidePointInside && !insidePointInside) {
		return undefined;
	}

	// Now we know outsidePoint is outside and insidePoint is inside
	const intersections: Intersection[] = [];

	// Check vertical edges if line is not vertical
	if (!isCloseToZero(dx)) {
		const leftIntersection = findVerticalEdgeIntersection(
			outsidePoint,
			dx,
			dy,
			rect.x,
			rect
		);
		const rightIntersection = findVerticalEdgeIntersection(
			outsidePoint,
			dx,
			dy,
			rect.x + rect.width,
			rect
		);

		if (leftIntersection) intersections.push(leftIntersection);
		if (rightIntersection) intersections.push(rightIntersection);
	}

	// Check horizontal edges if line is not horizontal
	if (!isCloseToZero(dy)) {
		const topIntersection = findHorizontalEdgeIntersection(
			outsidePoint,
			dx,
			dy,
			rect.y,
			rect
		);
		const bottomIntersection = findHorizontalEdgeIntersection(
			outsidePoint,
			dx,
			dy,
			rect.y + rect.height,
			rect
		);

		if (topIntersection) intersections.push(topIntersection);
		if (bottomIntersection) intersections.push(bottomIntersection);
	}

	// Find the intersection with the smallest t value (closest to outsidePoint)
	const closestIntersection = intersections.reduce((closest, current) => {
		return current.t < closest.t ? current : closest;
	}, intersections[0]);

	return closestIntersection.point;
}

/**
 * Checks if a point is horizontally or vertically aligned with a rectangle
 * Returns the aligned edge point if aligned, null otherwise
 */
export function getAlignedEdgePoint(
	point: CanvasPoint,
	rect: CanvasRect
): CanvasPoint | null {
	// Check if point is horizontally aligned with the rectangle
	if (point.x >= rect.x && point.x <= rect.x + rect.width) {
		// If aligned horizontally, return the point on the top or bottom edge
		if (point.y < rect.y) {
			return { x: point.x, y: rect.y }; // Top edge
		} else if (point.y > rect.y + rect.height) {
			return { x: point.x, y: rect.y + rect.height }; // Bottom edge
		}
	}

	// Check if point is vertically aligned with the rectangle
	if (point.y >= rect.y && point.y <= rect.y + rect.height) {
		// If aligned vertically, return the point on the left or right edge
		if (point.x < rect.x) {
			return { x: rect.x, y: point.y }; // Left edge
		} else if (point.x > rect.x + rect.width) {
			return { x: rect.x + rect.width, y: point.y }; // Right edge
		}
	}

	return null; // Not aligned
}
