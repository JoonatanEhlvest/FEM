import { BaseConnectorRenderer } from "../base/BaseConnectorRenderer";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";

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
}
