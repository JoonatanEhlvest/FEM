import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";

export class ProcessRenderer extends BaseInstanceRenderer {
	// Default styles for Process
	private static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: 2.5,
	};

	private static readonly GROUP_STYLE: Partial<InstanceDisplayStyle> = {
		strokeWidth: 2,
		strokeDasharray: "5,3",
	};

	private static readonly GHOST_STYLE: Partial<InstanceDisplayStyle> = {
		opacity: 0.7,
		stroke: "#9e9e9e",
	};

	private static readonly SELECTED_STYLE: Partial<InstanceDisplayStyle> = {
		stroke: "#2196f3",
		strokeWidth: 5,
	};

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...ProcessRenderer.DEFAULT_STYLE };
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		return (
			<ellipse
				cx={this.centerX}
				cy={this.centerY}
				rx={this.width / 2}
				ry={this.height / 2}
				fill={style.fill}
				stroke={style.stroke}
				strokeWidth={style.strokeWidth / this.zoom}
				strokeDasharray={style.strokeDasharray}
				opacity={style.opacity}
				filter={style.filter}
			/>
		);
	}
}
