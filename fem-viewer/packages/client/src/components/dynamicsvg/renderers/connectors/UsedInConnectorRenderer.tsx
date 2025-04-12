import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isUsedInConnector } from "@fem-viewer/types/Connector";

export class UsedInConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "black",
				strokeWidth: 1,
				opacity: 1,
				fill: "none",
			},
		};
	}

	/**
	 * Override to display asset types for Used In connectors
	 */
	protected getLabels(): string[] {
		const { connector } = this.props;
		const labels: string[] = [];

		// Check if connector has a note

		// Check if connector has assetTypes (for Used In connectors)
		if (isUsedInConnector(connector)) {
			// Add each asset type
			connector.assetTypes.forEach((asset) => {
				labels.push(asset);
			});
		}

		return labels;
	}
}
