import React from "react";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { BaseInstanceRenderer } from "../base/BaseInstanceRenderer";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { isProcessInstance } from "@fem-viewer/types/Instance";
import { IconRenderer } from "./icons/IconRenderer";

export class ProcessRenderer extends BaseInstanceRenderer {
	// Default styles for Process
	private static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: 1,
	};

	constructor(props: InstanceRendererProps) {
		super(props);
	}

	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...ProcessRenderer.DEFAULT_STYLE };
	}

	// Add process icon if available
	private addProcessIcon(): React.ReactElement | null {
		if (!isProcessInstance(this.instance) || !this.instance.icon) {
			return null;
		}

		const paddedX = this.x + 15;

		return (
			<IconRenderer
				iconType={this.instance.icon}
				x={paddedX}
				y={this.centerY}
			/>
		);
	}

	// Render simple arrow tips on the process borders
	private renderArrowTips(style: InstanceDisplayStyle): React.ReactElement[] {
		const arrows: React.ReactElement[] = [];
		const strokeWidth = style.strokeWidth / this.zoom;

		// Top arrow tip (slightly left of center)
		const topX = this.centerX - this.width * 0.1;
		const topY = this.y;

		// Bottom arrow tip (slightly right of center)
		const bottomX = this.centerX + this.width * 0.1;
		const bottomY = this.y + this.height;

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
				strokeDasharray = "2,2";
			}

			return (
				<>
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
						cx={this.centerX}
						cy={this.centerY}
						rx={this.width / 2}
						ry={this.height / 2}
						fill={style.fill}
						stroke={style.stroke}
						strokeWidth={style.strokeWidth / this.zoom}
						strokeDasharray={style.strokeDasharray}
						opacity={style.opacity}
						filter={style.filter}
					/>
					{/* Add second ellipse with smaller radius for primary processes */}
					{isPrimary && (
						<ellipse
							cx={this.centerX}
							cy={this.centerY}
							rx={this.width / 2 - 4}
							ry={this.height / 2 - 4}
							fill="none"
							stroke={style.stroke}
							strokeWidth={style.strokeWidth / this.zoom}
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
