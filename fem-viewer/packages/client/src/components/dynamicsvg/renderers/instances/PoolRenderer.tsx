import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";

export class PoolRenderer extends BaseInstanceRenderer {
	private static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: 1,
	};

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...PoolRenderer.DEFAULT_STYLE };
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		// Use a rounded rectangle for group pools, and cloud shape for regular pools
		if (this.instance.isGroup) {
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
		} else {
			// Calculate dimensions and positions for the cloud bubbles
			const bubbleRadius = Math.min(this.width, this.height) * 0.25;

			// Create cloud bubbles positions with more extension
			const bubbles = [
				{
					cx: this.x + bubbleRadius * 0.6,
					cy: this.y + this.height * 0.3,
					r: bubbleRadius * 1.1,
				},
				{
					cx: this.x + this.width * 0.3,
					cy: this.y + bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: this.centerX,
					cy: this.y + bubbleRadius * 0.5,
					r: bubbleRadius * 1.2,
				},
				{
					cx: this.x + this.width * 0.7,
					cy: this.y + bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: this.x + this.width - bubbleRadius * 0.6,
					cy: this.y + this.height * 0.3,
					r: bubbleRadius * 1.1,
				},
				{
					cx: this.x + this.width - bubbleRadius * 0.5,
					cy: this.centerY,
					r: bubbleRadius * 1.2,
				},
				{
					cx: this.x + this.width - bubbleRadius * 0.6,
					cy: this.y + this.height * 0.7,
					r: bubbleRadius * 1.1,
				},
				{
					cx: this.x + this.width * 0.7,
					cy: this.y + this.height - bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: this.centerX,
					cy: this.y + this.height - bubbleRadius * 0.5,
					r: bubbleRadius * 1.2,
				},
				{
					cx: this.x + this.width * 0.3,
					cy: this.y + this.height - bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: this.x + bubbleRadius * 0.6,
					cy: this.y + this.height * 0.7,
					r: bubbleRadius * 1.1,
				},
				{
					cx: this.x + bubbleRadius * 0.5,
					cy: this.centerY,
					r: bubbleRadius * 1.2,
				},
			];

			// Create SVG path for the cloud
			let path = `M ${bubbles[0].cx},${bubbles[0].cy}`;

			for (let i = 0; i < bubbles.length; i++) {
				const current = bubbles[i];
				const next = bubbles[(i + 1) % bubbles.length];

				// Create a curve between current and next bubble
				path += ` A ${current.r},${current.r} 0 0,1 ${
					(current.cx + next.cx) / 2
				},${(current.cy + next.cy) / 2}`;
			}

			path += " Z"; // Close the path

			return (
				<path
					d={path}
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
}
