import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isDrawingAddingConnector } from "@fem-viewer/types/Connector";
import React from "react";

export class DrawingAddingConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: 1,
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
