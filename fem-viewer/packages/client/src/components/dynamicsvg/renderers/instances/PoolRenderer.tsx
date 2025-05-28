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
			return {
				x: this.x,
				y: this.y + arrowHeight,
				width: this.width,
				height: this.height - arrowHeight * 2,
				centerX: this.centerX,
				centerY: this.centerY + arrowHeight,
			};
		}

		// Use default behavior for non-ghost elements
		return super.getPrimaryElementArea();
	}

	private drawScallopedEdge(
		pathParts: string[],
		startX: number,
		startY: number,
		numScallops: number,
		isHorizontal: boolean,
		direction: 1 | -1,
		lobeSize: number,
		lobeDepthFactor: number
	): { x: number; y: number } {
		let currentX = startX;
		let currentY = startY;

		for (let i = 0; i < numScallops; i++) {
			const displacement = lobeSize * lobeDepthFactor;
			const peakX = isHorizontal
				? currentX + (lobeSize / 2) * direction
				: currentX + displacement * direction;
			const peakY = isHorizontal
				? currentY - displacement * direction
				: currentY + (lobeSize / 2) * direction;
			const nextX = isHorizontal
				? currentX + lobeSize * direction
				: currentX;
			const nextY = isHorizontal
				? currentY
				: currentY + lobeSize * direction;

			pathParts.push(`Q ${peakX} ${peakY} ${nextX} ${nextY}`);

			currentX = nextX;
			currentY = nextY;
		}

		return { x: currentX, y: currentY };
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		const area = this.getPrimaryElementArea();

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
			const pathParts: string[] = [];
			const numHorizontalLobes = 7;
			const numVerticalLobes = 5;
			const hLobeWidth = area.width / numHorizontalLobes;
			const vLobeHeight = area.height / numVerticalLobes;
			const lobeDepthFactor = 0.3;

			const Dh = hLobeWidth * lobeDepthFactor; // Vertical displacement for horizontal lobes
			const Dv = vLobeHeight * lobeDepthFactor; // Horizontal displacement for vertical lobes

			const scallopsTopBottom = Math.max(0, numHorizontalLobes - 2);
			const scallopsLeftRight = Math.max(0, numVerticalLobes - 2);

			// Start at top-left (inset)
			let currentPos = { x: area.x + hLobeWidth, y: area.y + Dh };
			pathParts.push(`M ${currentPos.x} ${currentPos.y}`);

			// Top edge
			currentPos = this.drawScallopedEdge(
				pathParts,
				currentPos.x,
				currentPos.y,
				scallopsTopBottom,
				true,
				1,
				hLobeWidth,
				lobeDepthFactor
			);

			// Line to start of right edge (inset)
			currentPos = {
				x: area.x + area.width - Dv,
				y: area.y + vLobeHeight,
			};
			pathParts.push(`L ${currentPos.x} ${currentPos.y}`);

			// Right edge
			currentPos = this.drawScallopedEdge(
				pathParts,
				currentPos.x,
				currentPos.y,
				scallopsLeftRight,
				false,
				1,
				vLobeHeight,
				lobeDepthFactor
			);

			// Line to start of bottom edge (inset)
			currentPos = {
				x: area.x + area.width - hLobeWidth,
				y: area.y + area.height - Dh,
			};
			pathParts.push(`L ${currentPos.x} ${currentPos.y}`);

			// Bottom edge
			currentPos = this.drawScallopedEdge(
				pathParts,
				currentPos.x,
				currentPos.y,
				scallopsTopBottom,
				true,
				-1,
				hLobeWidth,
				lobeDepthFactor
			);

			// Line to start of left edge (inset)
			currentPos = {
				x: area.x + Dv,
				y: area.y + area.height - vLobeHeight,
			};
			pathParts.push(`L ${currentPos.x} ${currentPos.y}`);

			// Left edge
			currentPos = this.drawScallopedEdge(
				pathParts,
				currentPos.x,
				currentPos.y,
				scallopsLeftRight,
				false,
				-1,
				vLobeHeight,
				lobeDepthFactor
			);

			pathParts.push("Z"); // Close the path
			const path = pathParts.join(" ");

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
