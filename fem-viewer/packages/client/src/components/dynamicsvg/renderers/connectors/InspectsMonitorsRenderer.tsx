import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isInspectsMonitorsConnector } from "@fem-viewer/types/Connector";
import React from "react";
import { DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";
import { HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";

export class InspectsMonitorsRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		const { connector } = this.props;
		const isHighlighted =
			isInspectsMonitorsConnector(connector) &&
			connector.appearance === "Highlighted";

		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: isHighlighted
					? HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX
					: DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX,
				strokeDasharray: "10,5,2,5", // Dash, gap, dot, gap
				opacity: 1,
				fill: "none",
			},
			labelStyle: {
				...this.getDefaultLabelStyle(),
				maxWidthCm: 2.5,
			},
		};
	}

	/**
	 * Override to display the note for Inspects/Monitors connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		if (isInspectsMonitorsConnector(connector)) {
			labels.push(connector.note);
		}

		return labels;
	}

	/**
	 * Renders a rectangle at the base of the connector, perpendicular to the connector direction
	 */
	protected renderBaseDecoration(): React.ReactNode {
		const directionInfo = this.getFirstSegmentDirectionInfo();
		if (!directionInfo) return null;

		// Rectangle dimensions
		const width = 12; // Length perpendicular to connector
		const height = 3; // Thickness along connector

		// Offset distance from the start point (along the connector direction)
		const offset = height;
		const offsetPosition = this.getFirstSegmentOffsetPosition(offset);

		// Calculate rotation angle in degrees (add 90 degrees to make it perpendicular)
		const rotationDegrees = directionInfo.angleDeg + 90;

		return (
			<rect
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				fill={this.displayProperties.defaultStyle.stroke}
				stroke={this.displayProperties.defaultStyle.stroke}
				strokeWidth={this.displayProperties.defaultStyle.strokeWidth}
				transform={`translate(${offsetPosition.x}, ${offsetPosition.y}) rotate(${rotationDegrees})`}
			/>
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
