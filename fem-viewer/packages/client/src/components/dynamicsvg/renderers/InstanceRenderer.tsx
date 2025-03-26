import React from "react";
import { Instance, Model } from "@fem-viewer/types";
import {
	getInstanceDisplayProperties,
	getInstanceStyle,
	InstanceDisplayStyle,
} from "../utils/instanceMap";

// Conversion factor from centimeters to pixels
export const CM_TO_PX = 37.7952755906;

// Font settings for different text elements
// TODO: Take font size from instance
export const FONT_SETTINGS = {
	INSTANCE_LABEL: {
		fontFamily: "Arial, sans-serif",
		fontSize: "12px",
		fontWeight: "bold",
	},
	INSTANCE_SUBTEXT: {
		fontFamily: "Arial, sans-serif",
		fontSize: "10px",
		fontWeight: "normal",
	},
	CONNECTOR_LABEL: {
		fontFamily: "Arial, sans-serif",
		fontSize: "11px",
		fontWeight: "normal",
	},
	TOOLTIP: {
		fontFamily: "Arial, sans-serif",
		fontSize: "12px",
		fontWeight: "normal",
	},
	INSTANCE_NAME: {
		fontFamily: "Arial, sans-serif",
		fontSize: "12px",
		fontWeight: "bold",
	},
	INSTANCE_CLASS: {
		fontFamily: "Arial, sans-serif",
		fontSize: "10px",
		fontWeight: "normal",
		fontStyle: "italic",
	},
};

// Shape settings for different instance types
export const SHAPE_SETTINGS = {
	CORNER_RADIUS: 3,
};

interface InstanceRendererProps {
	instance: Instance;
	model: Model;
	onClick: () => void;
	isSelected: boolean;
	zoom: number;
}

/**
 * InstanceRenderer component
 *
 * Renders a model instance as an SVG element based on its position, class, and attributes like isGroup and isGhost.
 */
const InstanceRenderer: React.FC<InstanceRendererProps> = ({
	instance,
	model,
	onClick,
	isSelected,
	zoom,
}) => {
	// Skip rendering if the instance has no position data
	if (!instance.position) {
		return null;
	}

	// Calculate position and dimensions in pixels
	const x = instance.position.x * CM_TO_PX;
	const y = instance.position.y * CM_TO_PX;
	const width = instance.position.width * CM_TO_PX;
	const height = instance.position.height * CM_TO_PX;

	// Get display properties based on instance class
	const displayProperties = getInstanceDisplayProperties(instance.class);

	// Get custom fill color for the instance if available
	const customFill = getCustomFillColor(instance, model);

	// Get custom border color if available
	const customBorder = getCustomBorderColor(instance);

	// Get final style based on instance properties
	const style = getInstanceStyle(
		displayProperties,
		instance.isGroup,
		instance.isGhost,
		isSelected,
		customFill,
		customBorder
	);

	// Determine shape rendering based on class/type
	const renderShape = () => {
		switch (displayProperties.shape.type) {
			case "cloud":
				return renderCloud(x, y, width, height, style);
			case "ellipse":
				return renderEllipse(x, y, width, height, style);
			case "rect":
			default:
				return renderRectangle(
					x,
					y,
					width,
					height,
					style,
					displayProperties.shape.cornerRadius ||
						SHAPE_SETTINGS.CORNER_RADIUS
				);
		}
	};

	// Function to get custom fill color for the instance
	function getCustomFillColor(
		instance: Instance,
		model: Model
	): string | undefined {
		// Check if instance is a subclass itself
		const isInstanceSubclass = instance.class.includes("_Subclass");
		if (isInstanceSubclass) {
			// For subclasses, apply the appropriate background color based on ghost status
			if (instance.isGhost && instance.individualGhostBGColor) {
				const color = instance.individualGhostBGColor.replace("$", "#");
				return color;
			} else if (instance.individualBGColor) {
				const color = instance.individualBGColor.replace("$", "#");
				return color;
			}
		}

		// If color picker is set to "Default", don't apply custom colors
		if (instance.colorPicker === "Default") {
			return undefined;
		}

		// Apply subclass color if the instance has a subclass reference
		if (
			instance.Interrefs &&
			instance.Interrefs["Referenced Subclass"] &&
			(instance.colorPicker === "Subclass" ||
				instance.colorPicker === undefined)
		) {
			// Use the appropriate referenced background color based on ghost status
			if (instance.isGhost && instance.referencedGhostBGColor) {
				const color = instance.referencedGhostBGColor.replace("$", "#");
				return color;
			} else if (instance.referencedBGColor) {
				const color = instance.referencedBGColor.replace("$", "#");
				return color;
			}
		}

		// Check for individual background color
		if (
			instance.colorPicker === "Individual" ||
			instance.colorPicker === undefined
		) {
			if (instance.isGhost && instance.individualGhostBGColor) {
				const color = instance.individualGhostBGColor.replace("$", "#");
				return color;
			} else if (instance.individualBGColor) {
				const color = instance.individualBGColor.replace("$", "#");
				return color;
			}
		}

		// Return undefined to use the default background
		return undefined;
	}

	// Function to get custom border color for the instance
	function getCustomBorderColor(instance: Instance): string | undefined {
		// For both ghost and non-ghost instances, use the borderColor if available
		if (instance.borderColor) {
			const color = instance.borderColor.replace("$", "#");
			return color;
		}

		// If no custom border color is defined, return undefined to use the default
		return undefined;
	}

	// Render a rectangle with rounded corners
	const renderRectangle = (
		x: number,
		y: number,
		width: number,
		height: number,
		style: InstanceDisplayStyle,
		cornerRadius: number
	) => (
		<rect
			x={x}
			y={y}
			width={width}
			height={height}
			fill={style.fill}
			stroke={style.stroke}
			strokeWidth={style.strokeWidth}
			strokeDasharray={style.strokeDasharray || ""}
			opacity={style.opacity || 1}
			rx={cornerRadius}
			ry={cornerRadius}
			filter={style.filter || ""}
		/>
	);

	// Render an ellipse
	const renderEllipse = (
		x: number,
		y: number,
		width: number,
		height: number,
		style: InstanceDisplayStyle
	) => (
		<ellipse
			cx={x + width / 2}
			cy={y + height / 2}
			rx={width / 2}
			ry={height / 2}
			fill={style.fill}
			stroke={style.stroke}
			strokeWidth={style.strokeWidth}
			strokeDasharray={style.strokeDasharray || ""}
			opacity={style.opacity || 1}
			filter={style.filter || ""}
		/>
	);

	// Render a cloud shape (for Pool instances)
	const renderCloud = (
		x: number,
		y: number,
		width: number,
		height: number,
		style: InstanceDisplayStyle
	) => {
		// Calculate dimensions and positions for the cloud bubbles
		const bubbleRadius = Math.min(width, height) * 0.2;
		const centerX = x + width / 2;
		const centerY = y + height / 2;

		// Create cloud bubbles positions
		const bubbles = [
			{ cx: x + bubbleRadius, cy: y + height * 0.3, r: bubbleRadius },
			{
				cx: x + width * 0.3,
				cy: y + bubbleRadius,
				r: bubbleRadius * 0.9,
			},
			{ cx: centerX, cy: y + bubbleRadius, r: bubbleRadius * 1.1 },
			{
				cx: x + width * 0.7,
				cy: y + bubbleRadius,
				r: bubbleRadius * 0.9,
			},
			{
				cx: x + width - bubbleRadius,
				cy: y + height * 0.3,
				r: bubbleRadius,
			},
			{
				cx: x + width - bubbleRadius,
				cy: centerY,
				r: bubbleRadius * 1.1,
			},
			{
				cx: x + width - bubbleRadius,
				cy: y + height * 0.7,
				r: bubbleRadius,
			},
			{
				cx: x + width * 0.7,
				cy: y + height - bubbleRadius,
				r: bubbleRadius * 0.9,
			},
			{
				cx: centerX,
				cy: y + height - bubbleRadius,
				r: bubbleRadius * 1.1,
			},
			{
				cx: x + width * 0.3,
				cy: y + height - bubbleRadius,
				r: bubbleRadius * 0.9,
			},
			{ cx: x + bubbleRadius, cy: y + height * 0.7, r: bubbleRadius },
			{ cx: x + bubbleRadius, cy: centerY, r: bubbleRadius * 1.1 },
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
				strokeDasharray={style.strokeDasharray || ""}
				opacity={style.opacity || 1}
				filter={style.filter || ""}
			/>
		);
	};

	// Format instance text for display
	const displayName = instance.name || "Unnamed";

	// Split name into two lines if it's longer than a certain threshold
	const formatNameForDisplay = (name: string) => {
		// Set a character threshold for splitting
		const threshold = 15;

		// If name is shorter than threshold, return it as is
		if (name.length <= threshold) {
			return [name];
		}

		// Try to split on spaces, dashes, underscores, or periods
		const splitChars = [" ", "-", "_", "."];
		let bestSplitIndex = Math.floor(name.length / 2); // Default to middle
		let minDiff = name.length; // Track how balanced the split is

		// Find the best splitting point near the middle
		for (
			let i = Math.floor(name.length / 3);
			i <= Math.floor((name.length * 2) / 3);
			i++
		) {
			// Check if this position has a space or other splitting character
			if (splitChars.includes(name[i])) {
				const diff = Math.abs(i - name.length / 2);
				if (diff < minDiff) {
					bestSplitIndex = i;
					minDiff = diff;
				}
			}
		}

		// If a good splitting point was found, split at that point
		if (minDiff < name.length / 2) {
			// Split at the character and trim any splitting chars from line start/end
			const firstLine = name.substring(0, bestSplitIndex).trim();
			const secondLine = name.substring(bestSplitIndex).trim();
			return [firstLine, secondLine];
		}

		// If no good splitting point, just split in the middle
		return [
			name.substring(0, Math.ceil(name.length / 2)),
			name.substring(Math.ceil(name.length / 2)),
		];
	};

	// Get the name lines to display
	const nameLines = formatNameForDisplay(displayName);

	// Adjust font size based on zoom level for better readability
	const adjustedFontSize = (size: string) => {
		const numericSize = parseFloat(size);
		return `${Math.max(numericSize, numericSize / zoom)}px`;
	};

	// Add any indicators for group or ghost
	const renderIndicators = () => {
		if (instance.isGroup || instance.isGhost) {
			const indicators = [];

			if (instance.isGroup) {
				indicators.push(
					<text
						key="group-indicator"
						x={x + width - 10}
						y={y + 15}
						fontFamily={FONT_SETTINGS.INSTANCE_SUBTEXT.fontFamily}
						fontSize={adjustedFontSize("10px")}
						fill="#333"
						textAnchor="end"
					>
						[Group]
					</text>
				);
			}

			if (instance.isGhost) {
				indicators.push(
					<text
						key="ghost-indicator"
						x={x + width - 10}
						y={instance.isGroup ? y + 30 : y + 15}
						fontFamily={FONT_SETTINGS.INSTANCE_SUBTEXT.fontFamily}
						fontSize={adjustedFontSize("10px")}
						fill="#666"
						textAnchor="end"
						fontStyle="italic"
					>
						[Ghost]
					</text>
				);
			}

			return indicators;
		}

		return null;
	};

	return (
		<g
			onClick={onClick}
			style={{ cursor: "pointer" }}
			data-instance-id={instance.id}
			data-instance-class={instance.class}
			data-is-group={instance.isGroup ? "true" : "false"}
			data-is-ghost={instance.isGhost ? "true" : "false"}
		>
			{/* Render the instance shape */}
			{renderShape()}

			{/* Render instance name on one or two lines */}
			{nameLines.length === 1 ? (
				<text
					x={x + width / 2}
					y={y + height / 2 - (nameLines.length > 1 ? 8 : 0)}
					textAnchor="middle"
					dominantBaseline="central"
					fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
					fontSize={adjustedFontSize(
						FONT_SETTINGS.INSTANCE_NAME.fontSize
					)}
					fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
					opacity={instance.isGhost ? 0.7 : 1}
				>
					{nameLines[0]}
				</text>
			) : (
				<>
					<text
						x={x + width / 2}
						y={y + height / 2 - 8}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
						fontSize={adjustedFontSize(
							FONT_SETTINGS.INSTANCE_NAME.fontSize
						)}
						fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
						opacity={instance.isGhost ? 0.7 : 1}
					>
						{nameLines[0]}
					</text>
					<text
						x={x + width / 2}
						y={y + height / 2 + 8}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily={FONT_SETTINGS.INSTANCE_NAME.fontFamily}
						fontSize={adjustedFontSize(
							FONT_SETTINGS.INSTANCE_NAME.fontSize
						)}
						fontWeight={FONT_SETTINGS.INSTANCE_NAME.fontWeight}
						opacity={instance.isGhost ? 0.7 : 1}
					>
						{nameLines[1]}
					</text>
				</>
			)}

			{/* Render group/ghost indicators */}
			{renderIndicators()}
		</g>
	);
};

export default InstanceRenderer;
