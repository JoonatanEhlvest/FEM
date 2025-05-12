import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { isProcessInstance } from "@fem-viewer/types/Instance";
import { IconRenderer } from "./icons/IconRenderer";

export class ProcessRenderer extends BaseInstanceRenderer {
	constructor(props: InstanceRendererProps) {
		super(props);
	}

	// Add process icon if available
	private addProcessIcon(): React.ReactElement | null {
		if (!isProcessInstance(this.instance) || !this.instance.icon) {
			return null;
		}

		const area = this.getPrimaryElementArea();
		const paddedX = area.x + 15;

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
		const topY = area.y;

		// Bottom arrow tip (slightly right of center)
		const bottomX = area.centerX + area.width * 0.1;
		const bottomY = area.y + area.height;

		// Top arrow tip (V shape)
		arrows.push(
			<React.Fragment key="top-arrow-tip">
				<line
					x1={topX - 12}
					y1={topY - 5}
					x2={topX}
					y2={topY}
					stroke={style.stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity || 1}
				/>
				<line
					x1={topX - 12}
					y1={topY + 5}
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
					x1={bottomX + 12}
					y1={bottomY - 5}
					x2={bottomX}
					y2={bottomY}
					stroke={style.stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={style.strokeDasharray}
					opacity={style.opacity || 1}
				/>
				<line
					x1={bottomX + 12}
					y1={bottomY + 5}
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
