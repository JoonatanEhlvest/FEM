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
import {
	getSegmentLength,
	getSegmentUnitVector,
	getSegmentDirectionInfo,
	getOffsetPositionAlongSegment,
	getPerpendicularOffset,
} from "../../utils/segmentMath";
import {
	findBorderIntersection,
	getAlignedEdgePoint,
} from "../../utils/rectangleMath";

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
			const startPoint = findBorderIntersection(
				toAnchor,
				fromAnchor,
				fromRect
			);
			const endPoint = findBorderIntersection(
				fromAnchor,
				toAnchor,
				toRect
			);
			if (!startPoint || !endPoint) {
				return [];
			}
			return [{ from: startPoint, to: endPoint }];
		}

		// For connections with path points, check alignment with instance boundaries
		const segments: Segment[] = [];

		// Handle start point connection
		const firstPathPoint = pathPoints[0];
		let startPoint: CanvasPoint | undefined;

		// Check if first path point aligns with the from instance
		const startAlignedPoint = getAlignedEdgePoint(firstPathPoint, fromRect);
		if (startAlignedPoint) {
			// If aligned, connect directly to the aligned edge point
			startPoint = startAlignedPoint;
		} else {
			// Otherwise use the standard center-based intersection
			startPoint = findBorderIntersection(
				firstPathPoint,
				fromAnchor,
				fromRect
			);
		}

		if (!startPoint) {
			return [];
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
		let endPoint: CanvasPoint | undefined;

		// Check if last path point aligns with the to instance
		const endAlignedPoint = getAlignedEdgePoint(lastPathPoint, toRect);
		if (endAlignedPoint) {
			// If aligned, connect directly to the aligned edge point
			endPoint = endAlignedPoint;
		} else {
			// Otherwise use the standard center-based intersection
			endPoint = findBorderIntersection(lastPathPoint, toAnchor, toRect);
		}

		if (!endPoint) {
			return [];
		}

		// Add final segment
		segments.push({
			from: lastPathPoint,
			to: endPoint,
		});

		return segments;
	}

	/**
	 * Convenience method to get direction info for the first segment.
	 * Returns null if there are no segments.
	 */
	protected getFirstSegmentDirectionInfo(): ConnectorDirectionInfo | null {
		const segments = this.getSegments();
		if (segments.length === 0) return null;
		return getSegmentDirectionInfo(segments[0]);
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
		return getOffsetPositionAlongSegment(segments[0], distance);
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
	 * Creates offset segments for parallel lines
	 */
	protected createOffsetSegments(
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

	/**
	 * Creates a path with rounded corners for segments
	 * @param segments The segments to render
	 * @param cornerRadius The radius of the rounded corners
	 * @returns SVG path data string
	 */
	protected createRoundedCornerPath(
		segments: Segment[],
		cornerRadius: number = 8
	): string {
		if (segments.length <= 1) {
			// If only one segment, return a straight line
			const segment = segments[0];
			return `M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`;
		}

		// Start the path at the first point
		let path = `M ${segments[0].from.x} ${segments[0].from.y}`;

		for (let i = 0; i < segments.length - 1; i++) {
			const currentSegment = segments[i];
			const nextSegment = segments[i + 1];

			// Get the current and next segments' lengths
			const currentLength = getSegmentLength(currentSegment);
			const nextLength = getSegmentLength(nextSegment);

			// Limit the corner radius to the length of the shorter segment
			const maxRadius = Math.min(currentLength, nextLength);
			const limitedRadius = Math.min(cornerRadius, maxRadius);

			// Calculate the direction vectors of current and next segments
			const currentVector = getSegmentUnitVector(currentSegment);
			const nextVector = getSegmentUnitVector(nextSegment);

			// Calculate the points where the rounded corner should start and end
			const cornerStartX =
				currentSegment.to.x - currentVector.unitX * limitedRadius;
			const cornerStartY =
				currentSegment.to.y - currentVector.unitY * limitedRadius;
			const cornerEndX =
				nextSegment.from.x + nextVector.unitX * limitedRadius;
			const cornerEndY =
				nextSegment.from.y + nextVector.unitY * limitedRadius;

			// Add the line to the start of the corner, then the quadratic curve
			path += ` L ${cornerStartX} ${cornerStartY}`;
			path += ` Q ${currentSegment.to.x} ${currentSegment.to.y}, ${cornerEndX} ${cornerEndY}`;
		}

		// Add the final line segment
		const lastSegment = segments[segments.length - 1];
		path += ` L ${lastSegment.to.x} ${lastSegment.to.y}`;

		return path;
	}

	/**
	 * Creates a parallel path with rounded corners for transitive connectors
	 * @param segments The segments to render
	 * @param offset The perpendicular offset from the center line
	 * @param isUpper Whether this is the upper or lower parallel line
	 * @returns SVG path data string
	 */
	protected createParallelRoundedPath(
		segments: Segment[],
		offset: number,
		isUpper: boolean
	): string {
		const offsetSegments = this.createOffsetSegments(
			segments,
			offset,
			isUpper
		);
		return this.createRoundedCornerPath(offsetSegments, 8);
	}

	/**
	 * Renders a standard (non-transitive) connector path
	 */
	protected renderStandardPath(
		segments: Segment[],
		markerId?: string,
		additionalAttributes: React.SVGProps<SVGPathElement> = {}
	): React.ReactElement {
		// For connectors with multiple segments, we use a rounded corner path
		const pathData = this.createRoundedCornerPath(segments);

		return (
			<path
				key="connector-path"
				d={pathData}
				style={{
					...this.displayProperties.defaultStyle,
					markerEnd: markerId ? `url(#${markerId})` : undefined,
				}}
				{...additionalAttributes}
			/>
		);
	}

	/**
	 * Renders a transitive connector with parallel paths
	 */
	protected renderTransitivePath(
		segments: Segment[],
		offset: number,
		markerId?: string,
		additionalAttributes: React.SVGProps<SVGPathElement> = {}
	): React.ReactElement {
		const upperPath = this.createParallelRoundedPath(
			segments,
			offset,
			true
		);
		const lowerPath = this.createParallelRoundedPath(
			segments,
			offset,
			false
		);

		return (
			<g key="transitive-connector">
				<path
					d={upperPath}
					style={{
						...this.displayProperties.defaultStyle,
						markerEnd: undefined,
					}}
					{...additionalAttributes}
				/>
				<path
					d={lowerPath}
					style={{
						...this.displayProperties.defaultStyle,
						markerEnd: undefined,
					}}
					{...additionalAttributes}
				/>
				{markerId && (
					<path
						d={this.createRoundedCornerPath(segments)}
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

	protected getAdditionalConnectorAttributes(): React.SVGProps<SVGPathElement> {
		return {};
	}

	protected renderConnector(markerId?: string): React.ReactElement {
		const segments = this.getSegments();
		const { connector } = this.props;
		const isTransitive =
			(isManagesConnector(connector) || isUsedInConnector(connector)) &&
			connector.isTransitive;

		const additionalAttributes = this.getAdditionalConnectorAttributes();

		if (isTransitive) {
			return this.renderTransitivePath(
				segments,
				TRANSITIVE_DOUBLELINE_SPACING_PX / 2,
				markerId,
				additionalAttributes
			);
		}

		return this.renderStandardPath(
			segments,
			markerId,
			additionalAttributes
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
		const lineHeight = labelStyle.fontSize;

		// Render elements
		const labelElements: React.ReactElement[] = [];

			// Calculate total height of all labels
			const totalLabelHeight = wrappedLabels.flat().length * lineHeight;
			// Position the top of the text box at the middle point, accounting for vertical centering
		let currentY = middlePoint.y - totalLabelHeight / 2 + lineHeight / 2;

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
						transform={
							isVertical
								? `rotate(-90 ${middlePoint.x} ${middlePoint.y})`
								: undefined
						}
						>
							{line}
						</text>
					);
				});

				// Move to next label position with spacing
				currentY +=
					labelLines.length * lineHeight + labelStyle.fontSize * 0.5;
			});

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
				{this.renderConnector(showArrow ? markerId : undefined)}
				{this.renderLabel()}
			</g>
		);
	}
}
