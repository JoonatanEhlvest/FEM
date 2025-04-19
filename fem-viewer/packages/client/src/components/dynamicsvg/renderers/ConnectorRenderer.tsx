import React from "react";
import { Connector, Instance } from "@fem-viewer/types";
import { ConnectorRendererFactory } from "./factory/ConnectorRendererFactory";

interface ConnectorRendererProps {
	connector: Connector;
	fromInstance: Instance;
	toInstance: Instance;
	zoom: number;
}

const ConnectorRenderer: React.FC<ConnectorRendererProps> = (props) => {
	// Skip rendering if instances don't have position data
	if (!props.fromInstance.position || !props.toInstance.position) {
		return null;
	}

	const renderer = ConnectorRendererFactory.createRenderer(props);
	return renderer.render();
};

export default ConnectorRenderer;
