import React from "react";
import { Instance, Model } from "@fem-viewer/types";
import {
	isSubclass,
	isBorderSubclass,
	isNoteInstance,
	isProcessInstance,
} from "@fem-viewer/types/Instance";
import { InstanceDisplayStyle } from "../../types/InstanceDisplayStyle";
import { InstanceRendererProps } from "../../types/InstanceRendererTypes";
import {
	CM_TO_PX,
	CUSTOM_BORDER_STROKE_WIDTH_PX,
	DEFAULT_BORDER_STROKE_WIDTH_PX,
	PT_TO_PX,
} from "../../types/constants";
import { wrapText } from "../../utils/textWrapUtils";

// Font settings for instance text elements
const FONT_SETTINGS = {
	INSTANCE_NAME: {
		fontFamily: "Arial, sans-serif",
		fontWeight: "normal",
	},
	INSTANCE_SUBTEXT: {
		fontFamily: "Arial, sans-serif",
		fontWeight: "normal",
	},
};

// Default font size if not specified in the instance
const DEFAULT_FONT_SIZE = 10 * PT_TO_PX;
const DEFAULT_LINE_HEIGHT_SPACING = 1.2;

const DEFAULT_TEXT_WIDTH_PADDING = 4; // Default padding for text wrapping

// Height in px to offset main area for ghost arrow-above layout
const ARROW_HEIGHT = 16;

export abstract class BaseInstanceRenderer {
	// Common style modifiers for all instance types
	protected static readonly BASE_GROUP_STYLE: Partial<InstanceDisplayStyle> =
		{
			strokeDasharray: "8,8",
		};

	protected static readonly BASE_GHOST_STYLE: Partial<InstanceDisplayStyle> =
		{};

	protected static readonly BASE_SELECTED_STYLE: Partial<InstanceDisplayStyle> =
		{
			stroke: "#2196f3",
			strokeWidth: CUSTOM_BORDER_STROKE_WIDTH_PX,
			filter: "url(#blue-glow)",
		};

	protected static readonly BASE_HIGHLIGHTED_STYLE: Partial<InstanceDisplayStyle> =
		{
			stroke: "#FFDF00",
			strokeWidth: CUSTOM_BORDER_STROKE_WIDTH_PX,
			filter: "url(#yellow-glow)",
		};

	// Default style for most instances
	protected static readonly DEFAULT_STYLE: InstanceDisplayStyle = {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: DEFAULT_BORDER_STROKE_WIDTH_PX,
		textWidthPadding: DEFAULT_TEXT_WIDTH_PADDING, // Padding for text wrapping
	};

	protected instance: Instance;
	protected model: Model;
	protected onClick: () => void;
	protected isSelected: boolean;
	protected isHighlighted: boolean;
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
		this.isHighlighted =
			props.allOccurrencesHighlightedInstances?.includes(
				this.instance.id
			) || false;
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
		if (customBorder) {
			style.stroke = customBorder;
			style.strokeWidth = CUSTOM_BORDER_STROKE_WIDTH_PX;
		} else {
			style.strokeWidth = DEFAULT_BORDER_STROKE_WIDTH_PX;
		}

		// Apply modifiers in order
		if (this.instance.isGroup) {
			Object.assign(style, BaseInstanceRenderer.BASE_GROUP_STYLE);
		}
		if (this.instance.isGhost) {
			Object.assign(style, BaseInstanceRenderer.BASE_GHOST_STYLE);
		}
		if (this.isHighlighted) {
			Object.assign(style, BaseInstanceRenderer.BASE_HIGHLIGHTED_STYLE);
		}
		if (this.isSelected) {
			Object.assign(style, BaseInstanceRenderer.BASE_SELECTED_STYLE);
		}

		return style;
	}

	protected getCustomFillColor(): string | undefined {
		// For border subclass instances, always return transparent fill
		if (isBorderSubclass(this.instance)) {
			return "none";
		}

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

	protected getFontSize(): number {
		return this.instance.fontSize * PT_TO_PX || DEFAULT_FONT_SIZE;
	}

	/**
	 * Returns the area and position data for rendering the main instance element.
	 * For ghost elements (except notes), offsets the area for arrow-above layout.
	 * Subclasses should use this for all area/position data.
	 */
	protected getPrimaryElementArea() {
		const isGhost = this.instance.isGhost;
		const isGroup = this.instance.isGroup;
		const isProcess = isProcessInstance(this.instance);
		const isNote = isNoteInstance(this.instance);
		if (isGhost && !isGroup && !isNote && !isProcess) {
			return {
				x: this.x,
				y: this.y + ARROW_HEIGHT,
				width: this.width,
				height: this.height - ARROW_HEIGHT,
				centerX: this.centerX,
				centerY: this.centerY + ARROW_HEIGHT,
			};
		}
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			centerX: this.centerX,
			centerY: this.centerY,
		};
	}

	protected renderName(nameLines: string[]): React.ReactElement {
		// Get font size from instance or use default
		const fontSize = this.getFontSize();
		const lineHeightSpacing = DEFAULT_LINE_HEIGHT_SPACING;

		// Padding from instance edge in px
		const padX = 1;
		const padY = 1;

		// Use getPrimaryElementArea for all position/dimension data
		const area = this.getPrimaryElementArea();

		// For group instances, position text at the top, but account for padding
		const baseY = this.instance.isGroup
			? area.y + padY + fontSize / 2 // Position at top with proper padding
			: area.y +
			  area.height / 2 -
			  ((nameLines.length - 1) * fontSize) / 2; // Center vertically accounting for multiple lines

		// Create a unique clip path ID for this instance
		const clipId = `text-clip-${this.instance.id}`;

		return (
			<>
				{/* Define clip path with padding */}
				<defs>
					<clipPath id={clipId}>
						<rect
							x={area.x + padX}
							y={area.y + padY}
							width={area.width - 2 * padX}
							height={area.height - 2 * padY}
						/>
					</clipPath>
				</defs>

				{/* Text container with clip path applied */}
				<g clipPath={`url(#${clipId})`}>
					{nameLines.map((line, index) => (
						<text
							key={`line-${index}`}
							x={area.x + area.width / 2}
							y={baseY + index * fontSize * lineHeightSpacing}
							textAnchor="middle"
							dominantBaseline="central"
							fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
							fontSize={`${fontSize}px`}
							fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
						>
							{line}
						</text>
					))}
				</g>
			</>
		);
	}

	protected renderIndicators(): React.ReactElement | null {
		if (!this.instance.isGhost) {
			return null;
		}

		// Draw an arrow for ghost instances with the tip touching the right border
		const h = ARROW_HEIGHT; // Height of the arrow
		const w = h * 1.5; // Width proportional to height

		const tailWidth = w / 2.5;

		// Calculate points based on arrow height
		const halfH = h / 2;
		const quarterH = h / 4;

		// Define path based on arrow height
		const path = `
			M ${-w} ${-quarterH} 
			L ${-tailWidth} ${-quarterH} 
			L ${-tailWidth} ${-halfH} 
			L 0 0 
			L ${-tailWidth} ${halfH} 
			L ${-tailWidth} ${quarterH} 
			L ${-w} ${quarterH} 
			Z
		`;

		return (
			<path
				d={path}
				transform={`translate(${this.x + this.width}, ${
					this.y + ARROW_HEIGHT / 2
				})`}
				stroke={this.getInstanceStyle().stroke}
				strokeWidth="1.5"
				fill="none"
			/>
		);
	}

	protected formatNameForDisplay(name: string): string[] {
		// Get font size and family
		const fontSize = this.getFontSize();
		const fontFamily = FONT_SETTINGS.INSTANCE_NAME.fontFamily;

		// Get instance style for text width padding
		const style = this.getInstanceStyle();
		const padding = style.textWidthPadding ?? DEFAULT_TEXT_WIDTH_PADDING;

		// Use the text wrapping utility function with adjusted width for wrapping
		return wrapText(name, this.width, fontFamily, fontSize, padding);
	}

	render(): React.ReactElement {
		if (!this.instance.position) {
			return <></>;
		}

		const displayText = this.getDisplayText();
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
				data-is-highlighted={this.isHighlighted ? "true" : "false"}
			>
				{this.renderShape(style)}
				{this.renderName(nameLines)}
				{this.renderIndicators()}
			</g>
		);
	}

	// Default implementation of getDefaultStyle
	protected getDefaultStyle(): InstanceDisplayStyle {
		return { ...BaseInstanceRenderer.DEFAULT_STYLE };
	}

	/**
	 * Returns the text to display for this instance.
	 * Can be overridden by subclasses to customize the display text.
	 */
	protected getDisplayText(): string {
		if (isSubclass(this.instance) || isBorderSubclass(this.instance)) {
			return this.instance.name;
		}
		return this.instance.denomination;
	}
}
