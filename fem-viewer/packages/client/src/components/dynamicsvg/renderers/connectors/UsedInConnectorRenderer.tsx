import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";

export class UsedInConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "black",
				strokeWidth: 1,
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
