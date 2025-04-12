import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isInspectsMonitorsConnector } from "@fem-viewer/types/Connector";

export class InspectsMonitorsRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: 1,
				strokeDasharray: "10,5",
				opacity: 1,
				fill: "none",
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
}
