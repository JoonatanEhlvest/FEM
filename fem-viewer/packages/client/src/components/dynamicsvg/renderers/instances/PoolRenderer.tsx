import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";

export class PoolRenderer extends BaseInstanceRenderer {
	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		const area = this.getPrimaryElementArea();
		// Use a rounded rectangle for group pools, and cloud shape for regular pools
		if (this.instance.isGroup) {
			const cornerRadius = 8;
			return (
				<rect
					x={area.x}
					y={area.y}
					width={area.width}
					height={area.height}
					fill={style.fill}
					stroke={style.stroke}
					strokeWidth={style.strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity}
					filter={style.filter}
					rx={cornerRadius}
					ry={cornerRadius}
				/>
			);
		} else {
			// Calculate dimensions and positions for the cloud bubbles
			const bubbleRadius = Math.min(area.width, area.height) * 0.25;

			// Create cloud bubbles positions with more extension
			const bubbles = [
				{
					cx: area.x + bubbleRadius * 0.6,
					cy: area.y + area.height * 0.3,
					r: bubbleRadius * 1.1,
				},
				{
					cx: area.x + area.width * 0.3,
					cy: area.y + bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: area.centerX,
					cy: area.y + bubbleRadius * 0.5,
					r: bubbleRadius * 1.2,
				},
				{
					cx: area.x + area.width * 0.7,
					cy: area.y + bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: area.x + area.width - bubbleRadius * 0.6,
					cy: area.y + area.height * 0.3,
					r: bubbleRadius * 1.1,
				},
				{
					cx: area.x + area.width - bubbleRadius * 0.5,
					cy: area.centerY,
					r: bubbleRadius * 1.2,
				},
				{
					cx: area.x + area.width - bubbleRadius * 0.6,
					cy: area.y + area.height * 0.7,
					r: bubbleRadius * 1.1,
				},
				{
					cx: area.x + area.width * 0.7,
					cy: area.y + area.height - bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: area.centerX,
					cy: area.y + area.height - bubbleRadius * 0.5,
					r: bubbleRadius * 1.2,
				},
				{
					cx: area.x + area.width * 0.3,
					cy: area.y + area.height - bubbleRadius * 0.6,
					r: bubbleRadius,
				},
				{
					cx: area.x + bubbleRadius * 0.6,
					cy: area.y + area.height * 0.7,
					r: bubbleRadius * 1.1,
				},
				{
					cx: area.x + bubbleRadius * 0.5,
					cy: area.centerY,
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
					strokeWidth={style.strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity}
					filter={style.filter}
				/>
			);
		}
	}
}
