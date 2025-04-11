import React from "react";
import { Instance, Model } from "@fem-viewer/types";
import { isSubclass, isBorderSubclass } from "@fem-viewer/types/Instance";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import { CM_TO_PX } from "../../types/constants";

// Font settings for instance text elements
// TODO: get font size from model
const FONT_SETTINGS = {
	INSTANCE_NAME: {
		fontFamily: "Arial, sans-serif",
		fontSize: "12px",
		fontWeight: "bold",
	},
	INSTANCE_SUBTEXT: {
		fontFamily: "Arial, sans-serif",
		fontSize: "10px",
		fontWeight: "normal",
	},
};

export abstract class BaseInstanceRenderer {
	// Common style modifiers for all instance types
	protected static readonly BASE_GROUP_STYLE: Partial<InstanceDisplayStyle> =
		{
			strokeWidth: 2,
			strokeDasharray: "5,3",
		};

	protected static readonly BASE_GHOST_STYLE: Partial<InstanceDisplayStyle> =
		{
			opacity: 0.7,
			stroke: "#9e9e9e",
		};

	protected static readonly BASE_SELECTED_STYLE: Partial<InstanceDisplayStyle> =
		{
			stroke: "#2196f3",
			strokeWidth: 5,
		};

	protected instance: Instance;
	protected model: Model;
	protected onClick: () => void;
	protected isSelected: boolean;
	protected zoom: number;

	// Position and dimensions in pixels
	protected x: number = 0;
	protected y: number = 0;
	protected width: number = 0;
	protected height: number = 0;

	// Center coordinates in pixels (used for rendering)
	protected centerX: number = 0;
	protected centerY: number = 0;

	constructor(props: InstanceRendererProps) {
		this.instance = props.instance;
		this.model = props.model;
		this.onClick = props.onClick;
		this.isSelected = props.isSelected;
		this.zoom = props.zoom;

		// Calculate dimensions in pixels
		this.width = this.instance.position.width * CM_TO_PX;
		this.height = this.instance.position.height * CM_TO_PX;

		// Calculate center point coordinates
		this.setupCoordinates();
	}

	/**
	 * Setup coordinates based on instance position
	 * For most instances, x,y in the model represent the center point
	 * This method can be overridden by specific renderers (like NoteRenderer)
	 */
	protected setupCoordinates(): void {
		// Default behavior: position coordinates represent the center point
		this.centerX = this.instance.position.x * CM_TO_PX;
		this.centerY = this.instance.position.y * CM_TO_PX;

		// Calculate top-left corner for rendering
		this.x = this.centerX - this.width / 2;
		this.y = this.centerY - this.height / 2;
	}

	// Abstract methods that must be implemented by specific renderers
	protected abstract getDefaultStyle(): InstanceDisplayStyle;
	protected abstract renderShape(
		style: InstanceDisplayStyle
	): React.ReactElement;

	// Common method to get instance style with modifiers
	protected getInstanceStyle(): InstanceDisplayStyle {
		// Start with the type-specific default style
		const style: InstanceDisplayStyle = {
			...this.getDefaultStyle(),
		};

		// Apply custom colors if specified
		const customFill = this.getCustomFillColor();
		const customBorder = this.getCustomBorderColor();
		if (customFill) style.fill = customFill;
		if (customBorder) style.stroke = customBorder;

		// Apply modifiers in order
		if (this.instance.isGroup) {
			Object.assign(style, BaseInstanceRenderer.BASE_GROUP_STYLE);
		}
		if (this.instance.isGhost) {
			Object.assign(style, BaseInstanceRenderer.BASE_GHOST_STYLE);
		}
		if (this.isSelected) {
			Object.assign(style, BaseInstanceRenderer.BASE_SELECTED_STYLE);
		}

		return style;
	}

	protected getCustomFillColor(): string | undefined {
		const isInstanceSubclass = this.instance.class.includes("_Subclass");
		if (isInstanceSubclass) {
			if (this.instance.isGhost && this.instance.individualGhostBGColor) {
				return this.instance.individualGhostBGColor.replace("$", "#");
			} else if (this.instance.individualBGColor) {
				return this.instance.individualBGColor.replace("$", "#");
			}
		}

		if (this.instance.colorPicker === "Default") {
			// Use class-specific default colors when colorPicker is set to Default
			if (
				this.instance.isGroup &&
				this.instance.classGroupBackgroundColor
			) {
				return this.instance.classGroupBackgroundColor.replace(
					"$",
					"#"
				);
			} else if (
				this.instance.isGhost &&
				this.instance.classGhostBackgroundColor
			) {
				return this.instance.classGhostBackgroundColor.replace(
					"$",
					"#"
				);
			} else if (this.instance.classBackgroundColor) {
				return this.instance.classBackgroundColor.replace("$", "#");
			}
			return undefined;
		}

		if (
			this.instance.Interrefs &&
			this.instance.Interrefs["Referenced Subclass"] &&
			(this.instance.colorPicker === "Subclass" ||
				this.instance.colorPicker === undefined)
		) {
			if (this.instance.isGhost && this.instance.referencedGhostBGColor) {
				return this.instance.referencedGhostBGColor.replace("$", "#");
			} else if (this.instance.referencedBGColor) {
				return this.instance.referencedBGColor.replace("$", "#");
			}
		}

		if (
			this.instance.colorPicker === "Individual" ||
			this.instance.colorPicker === undefined
		) {
			if (this.instance.isGhost && this.instance.individualGhostBGColor) {
				return this.instance.individualGhostBGColor.replace("$", "#");
			} else if (this.instance.individualBGColor) {
				return this.instance.individualBGColor.replace("$", "#");
			}
		}

		return undefined;
	}

	protected getCustomBorderColor(): string | undefined {
		if (
			this.instance.Interrefs &&
			this.instance.Interrefs["Referenced Bsubclass"] &&
			this.instance.borderColorPicker === "Subclass"
		) {
			if (this.instance.referencedBorderColor) {
				return this.instance.referencedBorderColor.replace("$", "#");
			}
		}

		if (this.instance.borderColorPicker === "Individual") {
			if (this.instance.borderColor) {
				return this.instance.borderColor.replace("$", "#");
			}
		}

		return undefined;
	}

	protected renderName(nameLines: string[]): React.ReactElement {
		if (nameLines.length === 1) {
			return (
				<text
					x={this.x + this.width / 2}
					y={this.y + this.height / 2}
					textAnchor="middle"
					dominantBaseline="central"
					fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
					fontSize={this.getAdjustedFontSize(
						FONT_SETTINGS.INSTANCE_NAME.fontSize
					)}
					fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
					opacity={this.instance.isGhost ? 0.7 : 1}
				>
					{nameLines[0]}
				</text>
			);
		}

		return (
			<>
				<text
					x={this.x + this.width / 2}
					y={this.y + this.height / 2 - 8}
					textAnchor="middle"
					dominantBaseline="central"
					fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
					fontSize={this.getAdjustedFontSize(
						FONT_SETTINGS.INSTANCE_NAME.fontSize
					)}
					fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
					opacity={this.instance.isGhost ? 0.7 : 1}
				>
					{nameLines[0]}
				</text>
				<text
					x={this.x + this.width / 2}
					y={this.y + this.height / 2 + 8}
					textAnchor="middle"
					dominantBaseline="central"
					fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
					fontSize={this.getAdjustedFontSize(
						FONT_SETTINGS.INSTANCE_NAME.fontSize
					)}
					fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
					opacity={this.instance.isGhost ? 0.7 : 1}
				>
					{nameLines[1]}
				</text>
			</>
		);
	}

	protected renderIndicators(): React.ReactElement | null {
		if (!this.instance.isGhost) {
			return null;
		}

		// Draw an arrow for ghost instances with the tip touching the right border
		return (
			<path
				d="M -20 -4 L -8 -4 L -8 -8 L 0 0 L -8 8 L -8 4 L -20 4 Z"
				transform={`translate(${this.x + this.width}, ${this.y + 15})`}
				stroke="#666"
				strokeWidth="1.5"
				fill="none"
			/>
		);
	}

	protected formatNameForDisplay(name: string): string[] {
		const threshold = 15;
		if (name.length <= threshold) {
			return [name];
		}

		const splitChars = [" ", "-", "_", "."];
		let bestSplitIndex = Math.floor(name.length / 2);
		let minDiff = name.length;

		for (
			let i = Math.floor(name.length / 3);
			i <= Math.floor((name.length * 2) / 3);
			i++
		) {
			if (splitChars.includes(name[i])) {
				const diff = Math.abs(i - name.length / 2);
				if (diff < minDiff) {
					bestSplitIndex = i;
					minDiff = diff;
				}
			}
		}

		if (minDiff < name.length / 2) {
			const firstLine = name.substring(0, bestSplitIndex).trim();
			const secondLine = name.substring(bestSplitIndex).trim();
			return [firstLine, secondLine];
		}

		return [
			name.substring(0, Math.ceil(name.length / 2)),
			name.substring(Math.ceil(name.length / 2)),
		];
	}

	protected getAdjustedFontSize(size: string): string {
		const numericSize = parseFloat(size);
		return `${Math.max(numericSize, numericSize / this.zoom)}px`;
	}

	render(): React.ReactElement {
		if (!this.instance.position) {
			return <></>;
		}

		const displayText = (() => {
			if (this.instance.class === "Note") {
				return this.instance.description;
			}
			if (isSubclass(this.instance) || isBorderSubclass(this.instance)) {
				return this.instance.name;
			}
			return this.instance.denomination;
		})();

		const nameLines = this.formatNameForDisplay(displayText);
		const style = this.getInstanceStyle();

		return (
			<g
				onClick={this.onClick}
				style={{ cursor: "pointer" }}
				data-instance-id={this.instance.id}
				data-instance-class={this.instance.class}
				data-is-group={this.instance.isGroup ? "true" : "false"}
				data-is-ghost={this.instance.isGhost ? "true" : "false"}
			>
				{this.renderShape(style)}
				{this.renderName(nameLines)}
				{this.renderIndicators()}
			</g>
		);
	}
}
