import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { isAssetInstance } from "@fem-viewer/types/Instance";

export class AssetRenderer extends BaseInstanceRenderer {
	private static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: 1,
	};

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...AssetRenderer.DEFAULT_STYLE };
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		// Use rounded corners (rx=8, ry=8) for group instances, sharp corners (rx=0, ry=0) for regular assets
		const cornerRadius = this.instance.isGroup ? 8 : 0;

		// Apply special dash pattern for tacit assets
		let strokeDasharray = style.strokeDasharray;
		if (isAssetInstance(this.instance) && this.instance.isTacit) {
			// Alternating pattern with shorter and longer segments (e.g., "2,5,7,5")
			strokeDasharray = "2,5,7,5";
		}

		return (
			<rect
				x={this.x}
				y={this.y}
				width={this.width}
				height={this.height}
				fill={style.fill}
				stroke={style.stroke}
				strokeWidth={style.strokeWidth / this.zoom}
				strokeDasharray={strokeDasharray}
				opacity={style.opacity}
				filter={style.filter}
				rx={cornerRadius}
				ry={cornerRadius}
			/>
		);
	}
}
