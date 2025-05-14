import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { isProcessInstance } from "@fem-viewer/types/Instance";
import { IconRenderer } from "./icons/IconRenderer";

// Constants for process arrow decorations
const ARROW_TIP_WIDTH = 12; // Width of arrow tip in px
const ARROW_TIP_HEIGHT = 5; // Height of half of the arrow tip in px

export class ProcessRenderer extends BaseInstanceRenderer {
	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected getInstanceStyle(): InstanceDisplayStyle {
		const style = super.getInstanceStyle();
		style.textWidthPadding = 40;
		return style;
	}

	/**
	 * Override getPrimaryElementArea to account for arrow tip space
	 * This ensures the whole process (shape + arrows) fits in the instance area
	 */
	protected getPrimaryElementArea() {
		// Calculate adjusted dimensions to accommodate arrow tips
		return {
			x: this.x + ARROW_TIP_WIDTH / 2,
			y: this.y + ARROW_TIP_HEIGHT,
			width: this.width - ARROW_TIP_WIDTH,
			height: this.height - ARROW_TIP_HEIGHT * 2,
			centerX: this.centerX,
			centerY: this.centerY,
		};
	}

	// Add process icon if available
	private addProcessIcon(): React.ReactElement | null {
		if (!isProcessInstance(this.instance) || !this.instance.icon) {
			return null;
		}

		const area = this.getPrimaryElementArea();
		const paddedX = area.x + 10;

		return (
			<IconRenderer
				iconType={this.instance.icon}
				x={paddedX}
				y={area.centerY}
			/>
		);
	}

	// Render simple arrow tips on the process borders
	private renderArrowTips(style: InstanceDisplayStyle): React.ReactElement[] {
		const area = this.getPrimaryElementArea();
		const arrows: React.ReactElement[] = [];
		const strokeWidth = style.strokeWidth;

		// Top arrow tip (slightly left of center)
		const topX = area.centerX - area.width * 0.1;
		const topY = area.y; // Top edge of the adjusted area

		// Bottom arrow tip (slightly right of center)
		const bottomX = area.centerX + area.width * 0.1;
		const bottomY = area.y + area.height; // Bottom edge of the adjusted area

		// Top arrow tip (V shape)
		arrows.push(
			<React.Fragment key="top-arrow-tip">
				<line
					x1={topX - ARROW_TIP_WIDTH}
					y1={topY - ARROW_TIP_HEIGHT}
					x2={topX}
					y2={topY}
					stroke={style.stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity || 1}
				/>
				<line
					x1={topX - ARROW_TIP_WIDTH}
					y1={topY + ARROW_TIP_HEIGHT}
					x2={topX}
					y2={topY}
					stroke={style.stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity || 1}
				/>
			</React.Fragment>
		);

		// Bottom arrow tip (V shape)
		arrows.push(
			<React.Fragment key="bottom-arrow-tip">
				<line
					x1={bottomX + ARROW_TIP_WIDTH}
					y1={bottomY - ARROW_TIP_HEIGHT}
					x2={bottomX}
					y2={bottomY}
					stroke={style.stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity || 1}
				/>
				<line
					x1={bottomX + ARROW_TIP_WIDTH}
					y1={bottomY + ARROW_TIP_HEIGHT}
					x2={bottomX}
					y2={bottomY}
					stroke={style.stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity || 1}
				/>
			</React.Fragment>
		);

		return arrows;
	}

	protected renderShape(style: InstanceDisplayStyle): React.ReactElement {
		// Render process icon if available
		const iconElement = this.addProcessIcon();
		const area = this.getPrimaryElementArea();

		// Use a rounded rectangle for group processes, and ellipse for regular processes
		if (this.instance.isGroup) {
			const cornerRadius = 8;

			// Apply special dash pattern for group subprocess
			let strokeDasharray = style.strokeDasharray;
			if (
				isProcessInstance(this.instance) &&
				this.instance.isGroup &&
				this.instance.isSubprocessesGroup
			) {
				strokeDasharray = "3,6";
			}

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
					{this.renderArrowTips({ ...style, strokeDasharray })}
					{iconElement}
				</>
			);
		} else {
			const isPrimary =
				isProcessInstance(this.instance) &&
				this.instance.isPrimaryProcess;

			return (
				<>
					<ellipse
						cx={area.centerX}
						cy={area.centerY}
						rx={area.width / 2}
						ry={area.height / 2}
						fill={style.fill}
						stroke={style.stroke}
						strokeWidth={style.strokeWidth}
						strokeDasharray={style.strokeDasharray}
						opacity={style.opacity}
						filter={style.filter}
					/>
					{/* Add second ellipse with smaller radius for primary processes */}
					{isPrimary && (
						<ellipse
							cx={area.centerX}
							cy={area.centerY}
							rx={area.width / 2 - 4}
							ry={area.height / 2 - 4}
							fill="none"
							stroke={style.stroke}
							strokeWidth={style.strokeWidth}
							strokeDasharray={style.strokeDasharray}
							opacity={style.opacity}
							filter={style.filter}
						/>
					)}
					{this.renderArrowTips(style)}
					{iconElement}
				</>
			);
		}
	}
}
