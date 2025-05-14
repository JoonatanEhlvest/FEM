import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { isNoteInstance, isProcessInstance } from "@fem-viewer/types/Instance";

export class PoolRenderer extends BaseInstanceRenderer {
	constructor(props: InstanceRendererProps) {
		super(props);
	}

	/**
	 * Override getArrowHeight to make the arrow height scale with pool height
	 */
	protected getArrowHeight(): number {
		return this.height * 0.16;
	}

	/**
	 * Override getArrowWidth to make the arrow width scale with pool width
	 */
	protected getArrowWidth(): number {
		return this.width * 0.2;
	}

	/**
	 * Override getArrowPosition to position the arrow correctly for ghost pools
	 * This implementation preserves the center point of the element
	 */
	protected getArrowPosition(): { x: number; y: number } {
		// Get the default x position (right edge of element)
		const x = this.x + this.width;

		// For pools, we need to adjust the Y position to maintain the center point
		const h = this.getArrowHeight();

		// Calculate Y position to maintain the center point
		const y = this.y - h / 2;

		return { x, y };
	}

	/**
	 * Override getPrimaryElementArea to handle ghost pools
	 * This implementation preserves the center point of the element
	 */
	protected getPrimaryElementArea() {
		const isGhost = this.instance.isGhost;
		const isGroup = this.instance.isGroup;

		if (isGhost && !isGroup) {
			const arrowHeight = this.getArrowHeight();

			// Shift the entire element (arrow + shape) up by half the arrow height
			// so that the combined element stays centered at the original centerY
			const adjustedY = this.y - arrowHeight / 2;

			return {
				x: this.x,
				y: adjustedY + arrowHeight, // Main shape starts after the arrow
				width: this.width,
				height: this.height - arrowHeight, // Reduced height to account for arrow
				centerX: this.centerX,
				centerY: this.centerY, // Maintain the original center point
			};
		}

		// Use default behavior for non-ghost elements
		return super.getPrimaryElementArea();
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
