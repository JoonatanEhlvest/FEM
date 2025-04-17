import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import { isRelatesToConnector } from "@fem-viewer/types/Connector";

export class RelatesToConnectionRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		const { connector } = this.props;
		let strokeWidth = 1;

		if (isRelatesToConnector(connector)) {
			switch (connector.appearance) {
				case "Important":
					strokeWidth = 2;
					break;
				case "Very Important":
					strokeWidth = 3;
					break;
				default:
					strokeWidth = 1;
			}
		}

		return {
			defaultStyle: {
				stroke: "black",
				strokeWidth,
				opacity: 1,
				fill: "none",
			},
			arrowStyle: {
				visible: false,
			},
		};
	}

	/**
	 * Override to not display any labels for relates-to connectors
	 */
	protected getLabels(): string[] {
		return []; // Return empty array to display no labels
	}
}
