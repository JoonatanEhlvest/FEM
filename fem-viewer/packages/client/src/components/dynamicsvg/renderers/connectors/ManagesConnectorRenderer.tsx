import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isManagesConnector } from "@fem-viewer/types/Connector";
import {
	DEFAULT_CONNECTOR_STROKE_WIDTH_PX,
	HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX,
	TRANSITIVE_HIGHLIGHTED_STROKE_WIDTH_PX,
} from "../../types/constants";

export class ManagesConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		const { connector } = this.props;
		const isHighlighted =
			isManagesConnector(connector) &&
			connector.appearance === "Highlighted";

		const isTransitive =
			isManagesConnector(connector) && connector.isTransitive;

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
				strokeDasharray: "6,4",
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
	 * Override to display process types for Manages connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		if (isManagesConnector(connector)) {
			connector.processTypes.forEach((process) => {
				labels.push(process);
			});
		}

		return labels;
	}
}
