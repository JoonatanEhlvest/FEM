import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isDrawingAddingConnector } from "@fem-viewer/types/Connector";

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
}
