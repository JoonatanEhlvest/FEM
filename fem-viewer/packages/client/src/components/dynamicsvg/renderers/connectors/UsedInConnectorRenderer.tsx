import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import {
	ConnectorDisplayProperties,
	Segment,
} from "../../types/ConnectorTypes";
import { isUsedInConnector } from "@fem-viewer/types/Connector";
import React from "react";
import {
	DEFAULT_CONNECTOR_STROKE_WIDTH_PX,
	TRANSITIVE_HIGHLIGHTED_STROKE_WIDTH_PX,
} from "../../types/constants";
import { HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";

export class UsedInConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		const { connector } = this.props;
		const isHighlighted =
			isUsedInConnector(connector) &&
			connector.appearance === "Highlighted";

		const isTransitive =
			isUsedInConnector(connector) && connector.isTransitive;

		let strokeWidth = DEFAULT_CONNECTOR_STROKE_WIDTH_PX;
		if (isHighlighted) {
			strokeWidth = isTransitive
				? TRANSITIVE_HIGHLIGHTED_STROKE_WIDTH_PX
				: HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX;
		}

		return {
			defaultStyle: {
				stroke: "black",
				strokeWidth,
				opacity: 1,
				fill: "none",
			},
			labelStyle: {
				...this.getDefaultLabelStyle(),
				fontStyle: "italic",
			},
		};
	}

	/**
	 * Override to display asset types for Used In connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		// Check if connector has assetTypes (for Used In connectors)
		if (isUsedInConnector(connector)) {
			// Add each asset type
			connector.assetTypes.forEach((asset) => {
				labels.push(asset);
			});
		}

		return labels;
	}

	/**
	 * Renders two rectangles at the base of the connector for Stock assets,
	 * parallel to the connector direction.
	 */
	protected renderBaseDecoration(): React.ReactNode {
		const { connector } = this.props;
		if (
			!isUsedInConnector(connector) ||
			!connector.assetTypes.includes("Stock")
		) {
			return null;
		}

		const directionInfo = this.getFirstSegmentDirectionInfo();
		if (!directionInfo) return null;

		// Rectangle dimensions (relative to connector direction)
		const rectWidth = 6; // Length along the connector
		const rectHeight = 2; // Thickness perpendicular to the connector
		const gap = 6; // Gap between the two rectangles

		// Offset distance along the connector to the center of the rectangle pair
		// This places the start edge of the rectangles at the instance boundary
		const offsetDistance = rectWidth / 2;
		const centerPoint = this.getFirstSegmentOffsetPosition(offsetDistance);

		// Rotation angle (parallel to connector)
		const rotationDegrees = directionInfo.angleDeg;

		return (
			<g
				transform={`translate(${centerPoint.x}, ${centerPoint.y}) rotate(${rotationDegrees})`}
			>
				{/* Rectangle 1 (offset perpendicular to connector direction) */}
				<rect
					x={-rectWidth / 2}
					y={-rectHeight / 2 - gap / 2}
					width={rectWidth}
					height={rectHeight}
					fill={this.displayProperties.defaultStyle.stroke}
					stroke={this.displayProperties.defaultStyle.stroke}
					strokeWidth={
						this.displayProperties.defaultStyle.strokeWidth
					}
				/>
				{/* Rectangle 2 (offset perpendicular to connector direction) */}
				<rect
					x={-rectWidth / 2}
					y={rectHeight / 2 + gap / 2}
					width={rectWidth}
					height={rectHeight}
					fill={this.displayProperties.defaultStyle.stroke}
					stroke={this.displayProperties.defaultStyle.stroke}
					strokeWidth={
						this.displayProperties.defaultStyle.strokeWidth
					}
				/>
			</g>
		);
	}

	public render(): React.ReactElement {
		return (
			<>
				{super.render()}
				{this.renderBaseDecoration()}
			</>
		);
	}
}
