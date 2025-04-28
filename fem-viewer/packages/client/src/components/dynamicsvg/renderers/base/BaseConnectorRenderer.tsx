import React from "react";
import { Connector, Instance } from "@fem-viewer/types";
import {
	CM_TO_PX,
	TRANSITIVE_DOUBLELINE_SPACING_PX,
} from "../../types/constants";
import {
	ConnectorDisplayProperties,
	CanvasPoint,
	CanvasRect,
	Segment,
	Intersection,
	ConnectorDirectionInfo,
} from "../../types/ConnectorTypes";
import {
	isAssociationConnector,
	isInspectsMonitorsConnector,
} from "@fem-viewer/types/Connector";
import { isDrawingAddingConnector } from "@fem-viewer/types/Connector";
import {
	isManagesConnector,
	isUsedInConnector,
} from "@fem-viewer/types/Connector";
import { wrapText, calculateMaxCharsPerWidth } from "../../utils/textWrapUtils";

export interface ConnectorRendererProps {
	connector: Connector;
	fromInstance: Instance;
	toInstance: Instance;
	zoom: number;
}

export abstract class BaseConnectorRenderer {
	protected props: ConnectorRendererProps;
	protected displayProperties: ConnectorDisplayProperties;

	constructor(props: ConnectorRendererProps) {
		this.props = props;
		this.displayProperties = this.getDisplayProperties();
	}

	protected abstract getDisplayProperties(): ConnectorDisplayProperties;

	protected getInstanceRect(instance: Instance): CanvasRect {
		if (!instance.position) {
			throw new Error("Instance position is required");
		}

		const isNote =
			instance.class === "Note" || instance.class === "Note_Subclass";

		// For Notes, the coordinates represent the top-left corner
		if (isNote) {
			return {
				x: instance.position.x * CM_TO_PX,
				y: instance.position.y * CM_TO_PX,
				width: instance.position.width * CM_TO_PX,
				height: instance.position.height * CM_TO_PX,
			};
		}

		// For other instances, the coordinates represent the center point
		// Calculate the top-left corner for the rectangle
		return {
			x:
				instance.position.x * CM_TO_PX -
				(instance.position.width * CM_TO_PX) / 2,
			y:
				instance.position.y * CM_TO_PX -
				(instance.position.height * CM_TO_PX) / 2,
			width: instance.position.width * CM_TO_PX,
			height: instance.position.height * CM_TO_PX,
		};
	}

	protected getInstanceAnchor(instance: Instance): CanvasPoint {
		if (!instance.position) {
			throw new Error("Instance position is required");
		}
		return {
			x: instance.position.x * CM_TO_PX,
			y: instance.position.y * CM_TO_PX,
		};
	}

	protected isPointInsideRect(point: CanvasPoint, rect: CanvasRect): boolean {
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
	protected findVerticalEdgeIntersection(
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
	protected findHorizontalEdgeIntersection(
		p1: CanvasPoint,
		dx: number,
		dy: number,
		y: number,
		rect: CanvasRect
	): Intersection | null {
		// Calculate t where the line intersects the horizontal edge
		const t = (y - p1.y) / dy;

		// Only consider intersections in the forward direction from p1 (moving from p1 to p2)
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
	 * Checks if a value is effectively zero (less than half a pixel)
	 * Used to determine if a line is effectively vertical or horizontal
	 */
	protected isCloseToZero(value: number): boolean {
		return Math.abs(value) < 0.0001;
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
	protected findBorderIntersection(
		outsidePoint: CanvasPoint,
		insidePoint: CanvasPoint,
		rect: CanvasRect
	): CanvasPoint {
		const dx = insidePoint.x - outsidePoint.x;
		const dy = insidePoint.y - outsidePoint.y;

		const outsidePointInside = this.isPointInsideRect(outsidePoint, rect);
		const insidePointInside = this.isPointInsideRect(insidePoint, rect);

		// If both points are inside, this is an invalid case for finding border intersections
		if (outsidePointInside && insidePointInside) {
			throw new Error(
				"Both points are inside the rectangle. This is not a valid case for finding border intersections."
			);
		}

		// If points are in wrong order, swap them
		if (outsidePointInside && !insidePointInside) {
			return this.findBorderIntersection(insidePoint, outsidePoint, rect);
		}

		// If both points are outside, this is an invalid case
		if (!outsidePointInside && !insidePointInside) {
			throw new Error(
				"Both points are outside the rectangle. This is not a valid case for finding border intersections."
			);
		}

		// Now we know outsidePoint is outside and insidePoint is inside
		const intersections: Intersection[] = [];

		// Check vertical edges if line is not vertical
		if (!this.isCloseToZero(dx)) {
			const leftIntersection = this.findVerticalEdgeIntersection(
				outsidePoint,
				dx,
				dy,
				rect.x,
				rect
			);
			const rightIntersection = this.findVerticalEdgeIntersection(
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
		if (!this.isCloseToZero(dy)) {
			const topIntersection = this.findHorizontalEdgeIntersection(
				outsidePoint,
				dx,
				dy,
				rect.y,
				rect
			);
			const bottomIntersection = this.findHorizontalEdgeIntersection(
				outsidePoint,
				dx,
				dy,
				rect.y + rect.height,
				rect
			);

			if (topIntersection) intersections.push(topIntersection);
			if (bottomIntersection) intersections.push(bottomIntersection);
		}

		// Sort intersections by distance from outside point (smallest t first)
		intersections.sort((a, b) => a.t - b.t);

		// Return the closest intersection, or insidePoint if no intersections found
		return intersections.length > 0 ? intersections[0].point : insidePoint;
	}

	/**
	 * Converts path points from CM to pixels
	 */
	protected getPathPoints(): CanvasPoint[] {
		const { connector } = this.props;
		const pathPoints = connector.positions?.pathPoints || [];
		return pathPoints.map((point) => ({
			x: point.x * CM_TO_PX,
			y: point.y * CM_TO_PX,
		}));
	}

	/**
	 * Calculates the middle point for label placement
	 */
	protected getMiddlePoint(): CanvasPoint {
		const { connector } = this.props;
		// Use predefined middle point if available
		if (connector.positions.middlePoint) {
			return {
				x: connector.positions.middlePoint.x * CM_TO_PX,
				y: connector.positions.middlePoint.y * CM_TO_PX,
			};
		}

		// Get all segments of the connector
		const segments = this.getSegments();

		// Calculate total length of all segments
		let totalLength = 0;
		const segmentLengths = segments.map((segment) => {
			const dx = segment.to.x - segment.from.x;
			const dy = segment.to.y - segment.from.y;
			const length = Math.sqrt(dx * dx + dy * dy);
			totalLength += length;
			return length;
		});

		// Find the middle point along the path
		const targetLength = totalLength / 2;
		let accumulatedLength = 0;

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i];
			const segmentLength = segmentLengths[i];

			if (accumulatedLength + segmentLength >= targetLength) {
				// We found the segment containing the middle point
				const remainingLength = targetLength - accumulatedLength;
				const ratio = remainingLength / segmentLength;

				// Calculate the exact point along this segment
				return {
					x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
					y: segment.from.y + (segment.to.y - segment.from.y) * ratio,
				};
			}

			accumulatedLength += segmentLength;
		}

		// Fallback: if something goes wrong, return the last point
		return segments[segments.length - 1].to;
	}

	/**
	 * Checks if a point is horizontally or vertically aligned with a rectangle
	 * Returns the aligned edge point if aligned, null otherwise
	 */
	protected getAlignedEdgePoint(
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

	/**
	 * Calculates all segments of the connector path
	 */
	protected getSegments(): Segment[] {
		const pathPoints = this.getPathPoints();
		const fromAnchor = this.getInstanceAnchor(this.props.fromInstance);
		const toAnchor = this.getInstanceAnchor(this.props.toInstance);
		const fromRect = this.getInstanceRect(this.props.fromInstance);
		const toRect = this.getInstanceRect(this.props.toInstance);

		// For direct connections with no path points, use standard center-based connection
		if (pathPoints.length === 0) {
			const startPoint = this.findBorderIntersection(
				toAnchor,
				fromAnchor,
				fromRect
			);
			const endPoint = this.findBorderIntersection(
				fromAnchor,
				toAnchor,
				toRect
			);
			return [{ from: startPoint, to: endPoint }];
		}

		// For connections with path points, check alignment with instance boundaries
		const segments: Segment[] = [];

		// Handle start point connection
		const firstPathPoint = pathPoints[0];
		let startPoint: CanvasPoint;

		// Check if first path point aligns with the from instance
		const startAlignedPoint = this.getAlignedEdgePoint(
			firstPathPoint,
			fromRect
		);
		if (startAlignedPoint) {
			// If aligned, connect directly to the aligned edge point
			startPoint = startAlignedPoint;
		} else {
			// Otherwise use the standard center-based intersection
			startPoint = this.findBorderIntersection(
				firstPathPoint,
				fromAnchor,
				fromRect
			);
		}

		// Add first segment
		segments.push({ from: startPoint, to: firstPathPoint });

		// Add segments between path points
		for (let i = 0; i < pathPoints.length - 1; i++) {
			segments.push({
				from: pathPoints[i],
				to: pathPoints[i + 1],
			});
		}

		// Handle end point connection
		const lastPathPoint = pathPoints[pathPoints.length - 1];
		let endPoint: CanvasPoint;

		// Check if last path point aligns with the to instance
		const endAlignedPoint = this.getAlignedEdgePoint(lastPathPoint, toRect);
		if (endAlignedPoint) {
			// If aligned, connect directly to the aligned edge point
			endPoint = endAlignedPoint;
		} else {
			// Otherwise use the standard center-based intersection
			endPoint = this.findBorderIntersection(
				lastPathPoint,
				toAnchor,
				toRect
			);
		}

		// Add final segment
		segments.push({
			from: lastPathPoint,
			to: endPoint,
		});

		return segments;
	}

	/**
	 * Calculates direction information for a given segment.
	 */
	protected getSegmentDirectionInfo(
		segment: Segment
	): ConnectorDirectionInfo {
		const dx = segment.to.x - segment.from.x;
		const dy = segment.to.y - segment.from.y;
		const angleRad = Math.atan2(dy, dx);
		const angleDeg = (angleRad * 180) / Math.PI;
		const length = Math.sqrt(dx * dx + dy * dy);

		// Handle zero length case to avoid division by zero
		const unitX = length === 0 ? 0 : dx / length;
		const unitY = length === 0 ? 0 : dy / length;

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
	 * Calculates a point offset along a segment's direction from its start point.
	 */
	protected getOffsetPositionAlongSegment(
		segment: Segment,
		distance: number
	): CanvasPoint {
		const directionInfo = this.getSegmentDirectionInfo(segment);
		return {
			x: directionInfo.startPoint.x + directionInfo.unitX * distance,
			y: directionInfo.startPoint.y + directionInfo.unitY * distance,
		};
	}

	/**
	 * Convenience method to get direction info for the first segment.
	 * Returns null if there are no segments.
	 */
	protected getFirstSegmentDirectionInfo(): ConnectorDirectionInfo | null {
		const segments = this.getSegments();
		if (segments.length === 0) return null;
		return this.getSegmentDirectionInfo(segments[0]);
	}

	/**
	 * Convenience method to get offset position along the first segment.
	 * Returns the start point of first segment if there are no segments.
	 */
	protected getFirstSegmentOffsetPosition(distance: number): CanvasPoint {
		const segments = this.getSegments();
		if (segments.length === 0) {
			return { x: 0, y: 0 }; // Should not happen if called correctly
		}
		return this.getOffsetPositionAlongSegment(segments[0], distance);
	}

	protected renderMarker(
		markerId: string,
		refX: number,
		rotate: number = 0
	): React.ReactElement {
		const {
			width: arrowWidth,
			height: arrowHeight,
			viewBoxWidth,
			viewBoxHeight,
			viewBoxMidY,
		} = this.getArrowStyleSettings();

		// Build the arrow points string
		const arrowPoints = `0 0, ${viewBoxWidth} ${viewBoxMidY}, 0 ${viewBoxHeight}`;

		return (
			<marker
				id={markerId}
				markerWidth={arrowWidth}
				markerHeight={arrowHeight}
				refX={refX}
				refY={viewBoxMidY}
				orient="auto"
				overflow="visible"
				viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
				markerUnits="userSpaceOnUse"
			>
				<polyline
					points={arrowPoints}
					fill="none"
					stroke={this.displayProperties.defaultStyle.stroke}
					strokeWidth={
						this.displayProperties.defaultStyle.strokeWidth
					}
					transform={
						rotate
							? `rotate(${rotate} ${viewBoxWidth} ${viewBoxMidY})`
							: undefined
					}
				/>
			</marker>
		);
	}

	/**
	 * Override this method to add additional defs to the connector
	 */
	protected renderAdditionalDefs(): React.ReactNode {
		return null;
	}

	/**
	 * Override this method to add additional attributes to a segment
	 */
	protected getAdditionalSegmentAttributes(
		segment: Segment,
		index: number,
		isFirstSegment: boolean,
		isLastSegment: boolean
	): React.SVGProps<SVGPathElement> {
		return {};
	}

	protected renderSegment(
		segment: Segment,
		index: number,
		markerId?: string
	): React.ReactElement {
		const segments = this.getSegments();
		const isLastSegment = index === segments.length - 1;
		const isFirstSegment = index === 0;
		const { connector } = this.props;
		const isTransitive =
			(isManagesConnector(connector) || isUsedInConnector(connector)) &&
			connector.isTransitive;

		// Get additional attributes from subclass
		const additionalAttributes = this.getAdditionalSegmentAttributes(
			segment,
			index,
			isFirstSegment,
			isLastSegment
		);

		if (!isTransitive) {
			return (
				<path
					key={`segment-${index}`}
					d={`M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`}
					style={{
						...this.displayProperties.defaultStyle,
						markerEnd:
							isLastSegment && markerId
								? `url(#${markerId})`
								: undefined,
					}}
					{...additionalAttributes}
				/>
			);
		}

		// For transitive connectors, render two parallel lines
		const dx = segment.to.x - segment.from.x;
		const dy = segment.to.y - segment.from.y;
		const length = Math.sqrt(dx * dx + dy * dy);
		const offset = TRANSITIVE_DOUBLELINE_SPACING_PX / 2; // Half distance between the parallel lines

		// Calculate perpendicular offset
		const perpX = (-dy / length) * offset;
		const perpY = (dx / length) * offset;

		return (
			<g key={`segment-${index}`}>
				<path
					d={`M ${segment.from.x + perpX} ${
						segment.from.y + perpY
					} L ${segment.to.x + perpX} ${segment.to.y + perpY}`}
					style={{
						...this.displayProperties.defaultStyle,
						markerEnd: undefined,
					}}
					{...additionalAttributes}
				/>
				<path
					d={`M ${segment.from.x - perpX} ${
						segment.from.y - perpY
					} L ${segment.to.x - perpX} ${segment.to.y - perpY}`}
					style={{
						...this.displayProperties.defaultStyle,
						markerEnd: undefined,
					}}
					{...additionalAttributes}
				/>
				{isLastSegment && markerId && (
					<path
						d={`M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`}
						style={{
							...this.displayProperties.defaultStyle,
							markerEnd: `url(#${markerId})`,
							strokeWidth: 0,
						}}
						{...additionalAttributes}
					/>
				)}
			</g>
		);
	}

	/**
	 * Gets default labelStyle properties with sensible defaults.
	 * Can be extended/overridden in getDisplayProperties.
	 */
	protected getDefaultLabelStyle() {
		return {
			fontSize: 8,
			fill: "black",
			opacity: 1,
			fontFamily: "Arial",
			fontStyle: "normal",
			fontWeight: "normal",
			maxWidthCm: 2.0,
		};
	}

	/**
	 * Gets the labels to display for this connector.
	 * Returns an array of strings to display as labels, or empty array for no labels.
	 */
	protected getLabels(): string[] {
		// By default, return empty array (no labels)
		return [];
	}

	protected renderLabel(): React.ReactNode {
		const middlePoint = this.getMiddlePoint();
		const labels = this.getLabels();

		// If no labels, don't render anything
		if (labels.length === 0) {
			return null;
		}

		// Get label style from display properties, with defaults
		const defaultStyle = this.getDefaultLabelStyle();
		const labelStyle = {
			...defaultStyle,
			...this.displayProperties.labelStyle,
		};

		// Calculate max width for text wrapping
		const maxWidthPx = labelStyle.maxWidthCm * CM_TO_PX;
		// Calculate max chars that can fit in the width
		const maxCharsPerLine = calculateMaxCharsPerWidth(
			maxWidthPx,
			labelStyle.fontSize
		);

		// Check if connector has orientation property and it's set to Vertical
		const { connector } = this.props;
		let isVertical = false;
		if (
			isAssociationConnector(connector) ||
			isInspectsMonitorsConnector(connector) ||
			isDrawingAddingConnector(connector)
		) {
			isVertical = connector.orientation === "Vertical";
		}

		// Wrap each label and calculate total height
		const wrappedLabels = labels.map((label) =>
			wrapText(label, maxCharsPerLine)
		);
		const lineHeight = labelStyle.fontSize * 1.2;

		// Render elements
		const labelElements: React.ReactElement[] = [];

		// Apply different label placement based on orientation
		if (isVertical) {
			// For vertical labels
			let currentY = middlePoint.y;

			wrappedLabels.forEach((labelLines, labelIndex) => {
				const labelWidth = labelLines.length * lineHeight;
				const startX = middlePoint.x + labelWidth / 2 - lineHeight / 2;

				labelLines.forEach((line, lineIndex) => {
					labelElements.push(
						<text
							key={`label-${labelIndex}-line-${lineIndex}`}
							x={startX - lineIndex * lineHeight}
							y={currentY + labelStyle.fontSize}
							fontSize={labelStyle.fontSize}
							fontFamily={labelStyle.fontFamily}
							fontStyle={labelStyle.fontStyle}
							fontWeight={labelStyle.fontWeight}
							textAnchor="middle"
							fill={labelStyle.fill}
							opacity={labelStyle.opacity}
							transform={`rotate(-90 ${middlePoint.x} ${middlePoint.y})`}
							dominantBaseline="text-before-edge"
						>
							{line}
						</text>
					);
				});

				// Add spacing between different labels
				currentY += labelStyle.fontSize * 1.5;
			});
		} else {
			// For horizontal orientation (default)
			// Calculate total height of all labels
			const totalLabelHeight = wrappedLabels.flat().length * lineHeight;
			// Position the top of the text box at the middle point, accounting for vertical centering
			let currentY =
				middlePoint.y - totalLabelHeight / 2 + lineHeight / 2;

			wrappedLabels.forEach((labelLines, labelIndex) => {
				labelLines.forEach((line, lineIndex) => {
					labelElements.push(
						<text
							key={`label-${labelIndex}-line-${lineIndex}`}
							x={middlePoint.x}
							y={currentY + lineIndex * lineHeight}
							fontSize={labelStyle.fontSize}
							fontFamily={labelStyle.fontFamily}
							fontStyle={labelStyle.fontStyle}
							fontWeight={labelStyle.fontWeight}
							textAnchor="middle"
							fill={labelStyle.fill}
							opacity={labelStyle.opacity}
							dominantBaseline="text-before-edge"
						>
							{line}
						</text>
					);
				});

				// Move to next label position with spacing
				currentY +=
					labelLines.length * lineHeight + labelStyle.fontSize * 0.5;
			});
		}

		return <>{labelElements}</>;
	}

	/**
	 * Gets the arrow style settings with sensible defaults
	 */
	protected getArrowStyleSettings() {
		const arrowStyle = this.displayProperties.arrowStyle || {};

		const visible = arrowStyle.visible ?? true;
		const width = arrowStyle.width ?? 12;
		const height = arrowStyle.height ?? 9;

		// For consistent shape across different connectors
		const viewBoxWidth = 12;
		const viewBoxHeight = 9;

		// Calculate the midpoint of the arrow height for centering
		const viewBoxMidY = viewBoxHeight / 2;

		return {
			visible,
			width: visible ? width : 0,
			height: visible ? height : 0,
			viewBoxWidth,
			viewBoxHeight,
			viewBoxMidY,
		};
	}

	public render(): React.ReactElement {
		const segments = this.getSegments();
		const markerId = `arrowhead-${this.props.connector.id}`;

		const { visible: showArrow, viewBoxWidth } =
			this.getArrowStyleSettings();

		return (
			<g
				className="connector"
				data-connector-type={this.props.connector.class}
			>
				{showArrow && (
					<defs>
						{/* Default forward arrow marker */}
						{this.renderMarker(markerId, viewBoxWidth)}
						{/* Additional defs from subclass */}
						{this.renderAdditionalDefs()}
					</defs>
				)}
				{segments.map((segment, index) =>
					this.renderSegment(
						segment,
						index,
						showArrow ? markerId : undefined
					)
				)}
				{this.renderLabel()}
			</g>
		);
	}
}
