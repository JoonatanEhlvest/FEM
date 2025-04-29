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

		// Set font size to 12 for symbol labels
		const labelStyle = {
			...this.getDefaultLabelStyle(),
			maxWidthCm: 2.5,
		};

		if (
			isManagesConnector(connector) &&
			connector.labelType === "Symbol" &&
			connector.processTypes.length === 1
		) {
			labelStyle.fontSize = 12;
			labelStyle.fontWeight = "bold";
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
				fontStyle: "italic",
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
			// Only use symbols if there is exactly one process type and labelType is Symbol
			if (
				connector.labelType === "Symbol" &&
				connector.processTypes.length === 1
			) {
				const process = connector.processTypes[0];
				switch (process) {
					case "Acquire":
						labels.push("+");
						break;
					case "Maintain":
						labels.push("≈");
						break;
					case "Retire":
						labels.push("-");
						break;
					default:
						labels.push(process);
				}
			} else {
				// For text labels or multiple process types, use the process types as is
				connector.processTypes.forEach((process) => {
					labels.push(process);
				});
			}
		}

		return labels;
	}
}
