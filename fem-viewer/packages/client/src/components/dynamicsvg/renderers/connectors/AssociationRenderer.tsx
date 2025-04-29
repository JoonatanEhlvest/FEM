import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isAssociationConnector } from "@fem-viewer/types/Connector";
import { Segment } from "../../types/ConnectorTypes";
import React from "react";
import { HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";
import { DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX } from "../../types/constants";

export class AssociationRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		const { connector } = this.props;
		const isHighlighted =
			isAssociationConnector(connector) &&
			connector.appearance === "Highlighted";

		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: isHighlighted
					? HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX
					: DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX,
				strokeDasharray: "2,3",
				opacity: 1,
				fill: "none",
			},
			labelStyle: {
				...this.getDefaultLabelStyle(),
				maxWidthCm: 2.5,
			},
		};
	}

	protected renderAdditionalDefs(): React.ReactNode {
		const { connector } = this.props;
		const { viewBoxWidth } = this.getArrowStyleSettings();

		if (
			isAssociationConnector(connector) &&
			connector.direction === "Symmetric"
		) {
			const markerId = `start-marker-${connector.id}`;
			return this.renderMarker(markerId, viewBoxWidth, 180);
		}

		return null;
	}

	protected getAdditionalConnectorAttributes(): React.SVGProps<SVGPathElement> {
		const { connector } = this.props;
		if (
			!isAssociationConnector(connector) ||
			connector.direction !== "Symmetric"
		) {
			return {};
		}

		return {
			markerStart: `url(#start-marker-${connector.id})`,
		};
	}

	/**
	 * Override to display the note for Association connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		// For Association connectors, display the note if available
		if (isAssociationConnector(connector)) {
			labels.push(connector.note);
		}

		return labels;
	}

	public render(): React.ReactElement {
		return (
			<>
				{super.render()}
				{this.renderAdditionalDefs()}
			</>
		);
	}
}
