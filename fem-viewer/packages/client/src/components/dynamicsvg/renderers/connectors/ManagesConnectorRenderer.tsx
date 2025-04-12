import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isManagesConnector } from "@fem-viewer/types/Connector";

export class ManagesConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "black",
				strokeWidth: 1,
				strokeDasharray: "6,4",
				opacity: 1,
				fill: "none",
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
