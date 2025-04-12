import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isAssociationConnector } from "@fem-viewer/types/Connector";

export class AssociationRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: 1,
				strokeDasharray: "6,4",
				opacity: 1,
				fill: "none",
			},
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
}
