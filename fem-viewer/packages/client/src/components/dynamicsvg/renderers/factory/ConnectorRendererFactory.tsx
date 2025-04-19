import { ConnectorRendererProps } from "../base/BaseConnectorRenderer";
import { ManagesConnectorRenderer } from "../connectors/ManagesConnectorRenderer";
import { UsedInConnectorRenderer } from "../connectors/UsedInConnectorRenderer";
import { DrawingAddingConnectorRenderer } from "../connectors/DrawingAddingConnectorRenderer";
import { RelatesToConnectionRenderer } from "../connectors/RelatesToConnectionRenderer";
import { AssociationRenderer } from "../connectors/AssociationRenderer";
import { InspectsMonitorsRenderer } from "../connectors/InspectsMonitorsRenderer";
export class ConnectorRendererFactory {
	static createRenderer(props: ConnectorRendererProps) {
		switch (props.connector.class) {
			case "Manages":
				return new ManagesConnectorRenderer(props);
			case "Used In":
				return new UsedInConnectorRenderer(props);
			case "Drawing/Adding":
				return new DrawingAddingConnectorRenderer(props);
			case "relates-to":
				return new RelatesToConnectionRenderer(props);
			case "Association":
				return new AssociationRenderer(props);
			case "Inspects/Monitors":
				return new InspectsMonitorsRenderer(props);
			default:
				// Default to Manages renderer for unknown types
				return new ManagesConnectorRenderer(props);
		}
	}
}
