import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";

export class ExternalActorRenderer extends BaseInstanceRenderer {
	// Constant visual padding in pixels that we want to maintain
	private static readonly VISUAL_PADDING = 4;

	// Default styles for External Actor
	private static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: 1,
	};

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...ExternalActorRenderer.DEFAULT_STYLE };
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		const padding = ExternalActorRenderer.VISUAL_PADDING;

		return (
			<>
				{/* Outer rectangle */}
				<rect
					x={this.x}
					y={this.y}
					width={this.width}
					height={this.height}
					fill={style.fill}
					stroke={style.stroke}
					strokeWidth={style.strokeWidth / this.zoom}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity}
					filter={style.filter}
					rx={3}
					ry={3}
				/>
				{/* Inner rectangle */}
				<rect
					x={this.x + padding}
					y={this.y + padding}
					width={this.width - 2 * padding}
					height={this.height - 2 * padding}
					fill={style.fill}
					stroke={style.stroke}
					strokeWidth={style.strokeWidth / this.zoom}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity}
					filter={style.filter}
					rx={2}
					ry={2}
				/>
			</>
		);
	}
}
