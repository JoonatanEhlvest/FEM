import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";

export class ExternalActorRenderer extends BaseInstanceRenderer {
	// Constant visual padding in pixels that we want to maintain
	private static readonly VISUAL_PADDING = 4;

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	/**
	 * Override getArrowHeight to make the arrow height scale with external actor height
	 */
	protected getArrowHeight(): number {
		return this.height * 0.1;
	}

	/**
	 * Override getArrowWidth to make the arrow width scale with external actor width
	 */
	protected getArrowWidth(): number {
		return this.width * 0.15;
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

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		const padding = ExternalActorRenderer.VISUAL_PADDING;
		const area = this.getPrimaryElementArea();
		const isGroup = this.instance.isGroup;

		return (
			<>
				{/* Outer rectangle */}
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
					rx={3}
					ry={3}
				/>
				{/* Inner rectangle */}
				{!isGroup && (
					<rect
						x={area.x + padding}
						y={area.y + padding}
						width={area.width - 2 * padding}
						height={area.height - 2 * padding}
						fill={style.fill}
						stroke={style.stroke}
						strokeWidth={style.strokeWidth}
						strokeDasharray={style.strokeDasharray}
						opacity={style.opacity}
						filter={style.filter}
						rx={2}
						ry={2}
					/>
				)}
			</>
		);
	}
}
