import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";

export class ManagesConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "#3498db",
				strokeWidth: 4,
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
