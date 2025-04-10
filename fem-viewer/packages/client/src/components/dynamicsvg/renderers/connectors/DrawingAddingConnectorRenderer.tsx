import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";

export class DrawingAddingConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "blue",
				strokeWidth: 2,
				strokeDasharray: "10,5",
				opacity: 1,
				fill: "none",
			},
			labelStyle: {
				fontSize: 8,
				fill: "#555555",
				opacity: 0.8,
			},
		};
	}
}
