import React from "react";
import { InstanceRendererFactory } from "./factory/InstanceRendererFactory";
import { CM_TO_PX } from "../types/constants";
import { InstanceRendererProps } from "../types/InstanceRendererTypes";

/**
 * InstanceRenderer component
 *
 * Renders a model instance as an SVG element based on its position, class, and attributes like isGroup and isGhost.
 */
const InstanceRenderer: React.FC<InstanceRendererProps> = (props) => {
	const renderer = InstanceRendererFactory.createRenderer(props);
	return renderer.render();
};

export default InstanceRenderer;
