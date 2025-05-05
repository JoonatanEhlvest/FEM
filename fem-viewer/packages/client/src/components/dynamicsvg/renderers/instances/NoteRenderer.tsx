import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { CM_TO_PX } from "../../types/constants";

export class NoteRenderer extends BaseInstanceRenderer {
	// Custom style for notes with light yellow background
	protected static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		...BaseInstanceRenderer.DEFAULT_STYLE,
		fill: "#FFFCE8", // Light yellow default fill for notes
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

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		// Create a path for a note shape with sharp corners and a folded top-right corner
		const foldSize = 15;

		// Define the path for the note shape
		const path = `
			M ${this.x},${this.y}
			H ${this.x + this.width - foldSize}
			L ${this.x + this.width},${this.y + foldSize}
			V ${this.y + this.height}
			H ${this.x}
			Z
		`;

		return (
			<>
				<path
					d={path}
					fill={style.fill}
					stroke={style.stroke}
					strokeWidth={style.strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity}
					filter={style.filter}
				/>
			</>
		);
	}

	/**
	 * Override getDisplayText for Notes to use the description instead of name/denomination
	 */
	protected getDisplayText(): string {
		return this.instance.description;
	}
}
