import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isDrawingAddingConnector } from "@fem-viewer/types/Connector";
import React from "react";
import { DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";
import { HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";

export class DrawingAddingConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		const { connector } = this.props;
		const isHighlighted =
			isDrawingAddingConnector(connector) &&
			connector.appearance === "Highlighted";

		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: isHighlighted
					? HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX
					: DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX,
				strokeDasharray: "10,5",
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
	 * Override to display the note for Drawing/Adding connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		if (isDrawingAddingConnector(connector)) {
			labels.push(connector.note);
		}

		return labels;
	}

	/**
	 * Renders a circle at the base of the connector
	 */
	protected renderBaseDecoration(): React.ReactNode {
		const directionInfo = this.getFirstSegmentDirectionInfo();
		if (!directionInfo) return null;

		// Circle radius and offset
		const radius = 3;
		const offset = radius;
		const offsetPosition = this.getFirstSegmentOffsetPosition(offset);

		return (
			<circle
				cx={offsetPosition.x}
				cy={offsetPosition.y}
				r={radius}
				fill={this.displayProperties.defaultStyle.stroke}
				stroke={this.displayProperties.defaultStyle.stroke}
				strokeWidth={this.displayProperties.defaultStyle.strokeWidth}
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
