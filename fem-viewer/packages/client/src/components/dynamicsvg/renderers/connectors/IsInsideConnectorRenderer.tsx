import React from "react";
import { ConnectorDisplayProperties } from "../../types/ConnectorTypes";
import {
	BaseConnectorRenderer,
	ConnectorRendererProps,
} from "../base/BaseConnectorRenderer";

/**
 * Renders the "Is inside" connector.
 * These connectors represent containment relationships and are not visually shown.
 */
export class IsInsideConnectorRenderer extends BaseConnectorRenderer {
	protected getDisplayProperties(): ConnectorDisplayProperties {
		return {
			defaultStyle: {
				stroke: "transparent",
				strokeWidth: 0,
				strokeDasharray: "none",
			},
			// No arrow for "Is inside" connectors
			arrowStyle: {
				visible: false,
			},
			labelStyle: {
				...this.getDefaultLabelStyle(),
				maxWidthCm: 2.5,
			},
		};
	}

	public render(): React.ReactElement {
		// Return an empty group element - we don't render anything for "Is inside" connectors
		return (
			<g
				className="connector is-inside-connector"
				data-connector-type="Is inside"
			></g>
		);
	}
}

export default function IsInsideConnector(
	props: ConnectorRendererProps
): React.ReactElement {
	const renderer = new IsInsideConnectorRenderer(props);
	return renderer.render();
}
