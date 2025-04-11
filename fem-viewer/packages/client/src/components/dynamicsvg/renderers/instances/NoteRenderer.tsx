import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { CM_TO_PX } from "../../types/constants";

export class NoteRenderer extends BaseInstanceRenderer {
	private static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "#FFFCE8", // Light yellow default fill for notes
		stroke: "#000000",
		strokeWidth: 1,
	};

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	/**
	 * Override setupCoordinates for Notes
	 * For Notes, x,y represent the top-left corner in the model
	 */
	protected setupCoordinates(): void {
		// For Notes, position coordinates represent the top-left corner
		this.x = this.instance.position!.x * CM_TO_PX;
		this.y = this.instance.position!.y * CM_TO_PX;

		// Calculate center point from top-left
		this.centerX = this.x + this.width / 2;
		this.centerY = this.y + this.height / 2;
	}

	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...NoteRenderer.DEFAULT_STYLE };
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		const cornerRadius = 8;

		return (
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
				rx={cornerRadius}
				ry={cornerRadius}
			/>
		);
	}
}
