import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";

export class UsedInConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "#2ecc71",
				strokeWidth: 4,
				strokeDasharray: "6,4",
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
