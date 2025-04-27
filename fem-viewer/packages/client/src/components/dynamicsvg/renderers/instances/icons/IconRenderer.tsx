import React from "react";
import {
	getKeyFromValue,
	IconValue,
	ArtefactSubtypeIcon,
} from "@fem-viewer/types/Icons";

// Define base path for icons
const ICON_BASE_PATH = "/icons/";

/**
 * Utility function to get the filename for a given icon type
 *
 * @param iconValue The full icon description from the instance
 * @returns The filename to use for the icon (without extension)
 */
function getIconFilename(iconValue: IconValue): string {
	const key = getKeyFromValue(iconValue);
	if (key) {
		return key;
	}

	// Fallback: just use the lowercase value and hope it matches a filename
	return iconValue.toLowerCase().trim();
}

export interface IconRendererProps {
	iconType: IconValue;
	iconSubType?: ArtefactSubtypeIcon;
	x: number;
	y: number;
	size?: number;
	zoom?: number;
}

/**
 * Renders an icon image for a FEM instance
 */
export const IconRenderer: React.FC<IconRendererProps> = ({
	iconType,
	iconSubType,
	x,
	y,
	size = 20,
}) => {
	// Determine which icon file to use
	let iconFileName: string;

	// Handle artefact subtypes first
	if (iconType.toLowerCase() === "artefact" && iconSubType) {
		// For artefact subtypes, convert value to key if needed
		iconFileName = getIconFilename(iconSubType);
	} else {
		// For regular icons, use the icon filename via our utility
		iconFileName = getIconFilename(iconType);
	}

	const iconPath = `${ICON_BASE_PATH}${iconFileName}.png`;

	return (
		<image
			href={iconPath}
			x={x - size / 2}
			y={y - size / 2}
			width={size}
			height={size}
			preserveAspectRatio="xMidYMid meet"
		/>
	);
};
