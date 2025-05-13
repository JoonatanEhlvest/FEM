import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { isAssetInstance } from "@fem-viewer/types/Instance";
import { IconRenderer } from "./icons/IconRenderer";

export class AssetRenderer extends BaseInstanceRenderer {
	constructor(props: InstanceRendererProps) {
		super(props);
	}

	// Add asset icon if available
	private addAssetIcon(): React.ReactElement | null {
		if (!isAssetInstance(this.instance) || !this.instance.icon) {
			return null;
		}

		// For assets, position at top-left with some padding
		const area = this.getPrimaryElementArea();
		const iconX = area.x + 10;
		const iconY = area.y + 10;

		return (
			<IconRenderer
				iconType={this.instance.icon}
				iconSubType={this.instance.iconForArtefact}
				x={iconX}
				y={iconY}
			/>
		);
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

		// Render asset icon if available
		const iconElement = this.addAssetIcon();
		const area = this.getPrimaryElementArea();

		return (
			<>
				<rect
					x={area.x}
					y={area.y}
					width={area.width}
					height={area.height}
					fill={style.fill}
					stroke={style.stroke}
					strokeWidth={style.strokeWidth}
					strokeDasharray={strokeDasharray}
					opacity={style.opacity}
					filter={style.filter}
					rx={cornerRadius}
					ry={cornerRadius}
				/>
				{iconElement}
			</>
		);
	}
}
