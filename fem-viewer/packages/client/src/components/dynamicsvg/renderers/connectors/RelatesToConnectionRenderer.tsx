import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";

export class RelatesToConnectionRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "black",
				strokeWidth: 1,
				opacity: 1,
				fill: "none",
			},
			arrowStyle: {
				visible: false,
			},
		};
	}
}
