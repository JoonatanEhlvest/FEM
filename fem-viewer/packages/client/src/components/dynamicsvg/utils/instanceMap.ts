import {
	BaseInstanceClass,
	InstanceClass,
	getBaseInstanceClass,
} from "@fem-viewer/types/InstanceClass";

/**
 * Type definitions for instance display properties
 */
export interface InstanceDisplayShape {
	type: "rect" | "ellipse" | "cloud" | "diamond" | "hexagon";
	cornerRadius?: number;
}

export interface InstanceDisplayStyle {
	fill: string;
	stroke: string;
	strokeWidth: number;
	strokeDasharray?: string;
	opacity?: number;
	filter?: string;
}

export interface InstanceDisplayProperties {
	shape: InstanceDisplayShape;
	defaultStyle: InstanceDisplayStyle;
	groupStyle?: Partial<InstanceDisplayStyle>;
	ghostStyle?: Partial<InstanceDisplayStyle>;
	selectedStyle?: Partial<InstanceDisplayStyle>;
}

/**
 * Default base styles that are shared across instance types
 */
const DEFAULT_STYLES = {
	// Base default style for all instances
	DEFAULT: {
		fill: "transparent",
		stroke: "#000000",
		strokeWidth: 2.5,
	},
	// Style applied when an instance is a group
	GROUP: {
		strokeWidth: 2,
		strokeDasharray: "5,3",
	},
	// Style applied when an instance is a ghost
	GHOST: {
		opacity: 1,
		stroke: "#9e9e9e",
	},
	// Style applied when an instance is selected
	SELECTED: {
		stroke: "#2196f3",
		strokeWidth: 5,
	},
};

/**
 * Maps BaseInstanceClass types to their display properties
 */
export const instanceClassMap: Record<
	BaseInstanceClass,
	InstanceDisplayProperties
> = {
	Process: {
		shape: {
			type: "ellipse",
		},
		defaultStyle: { ...DEFAULT_STYLES.DEFAULT },
		groupStyle: { ...DEFAULT_STYLES.GROUP },
		ghostStyle: { ...DEFAULT_STYLES.GHOST },
		selectedStyle: { ...DEFAULT_STYLES.SELECTED },
	},
	Asset: {
		shape: {
			type: "rect",
			cornerRadius: 0,
		},
		defaultStyle: {
			...DEFAULT_STYLES.DEFAULT,
		},
		groupStyle: { ...DEFAULT_STYLES.GROUP },
		ghostStyle: { ...DEFAULT_STYLES.GHOST },
		selectedStyle: { ...DEFAULT_STYLES.SELECTED },
	},
	Pool: {
		shape: {
			type: "cloud",
		},
		defaultStyle: { ...DEFAULT_STYLES.DEFAULT },
		groupStyle: { ...DEFAULT_STYLES.GROUP },
		ghostStyle: { ...DEFAULT_STYLES.GHOST },
		selectedStyle: { ...DEFAULT_STYLES.SELECTED },
	},
	Note: {
		shape: {
			type: "rect",
			cornerRadius: 5,
		},
		defaultStyle: {
			...DEFAULT_STYLES.DEFAULT,
		},
		groupStyle: {
			...DEFAULT_STYLES.GROUP,
		},
		ghostStyle: { ...DEFAULT_STYLES.GHOST },
		selectedStyle: { ...DEFAULT_STYLES.SELECTED },
	},
	"External Actor": {
		shape: {
			type: "rect",
		},
		defaultStyle: { ...DEFAULT_STYLES.DEFAULT },
		groupStyle: { ...DEFAULT_STYLES.GROUP },
		ghostStyle: { ...DEFAULT_STYLES.GHOST },
		selectedStyle: { ...DEFAULT_STYLES.SELECTED },
	},
};

/**
 * Function to get display properties for a specific instance class
 *
 * @param instanceClass - The instance class to get properties for
 * @returns The display properties for the instance class or default properties
 */
export const getInstanceDisplayProperties = (
	instanceClass: InstanceClass
): InstanceDisplayProperties => {
	// Lets use the baseInstanceClass display properties for the given instanceClass
	const baseInstanceClass = getBaseInstanceClass(instanceClass);

	// Try matching base class
	for (const [baseClass, properties] of Object.entries(instanceClassMap)) {
		if (baseInstanceClass === baseClass) {
			return properties;
		}
	}
	// Default to Asset display properties if no match found
	return instanceClassMap.Asset;
};

/**
 * Function to get final style for an instance based on its properties
 *
 * @param properties - The base display properties for the instance class
 * @param isGroup - Whether the instance is a group
 * @param isGhost - Whether the instance is a ghost
 * @param isSelected - Whether the instance is selected
 * @param customFill - Optional custom fill color to override the default
 * @param customBorder - Optional custom border color to override the default
 * @returns The final style for the instance
 */
export const getInstanceStyle = (
	properties: InstanceDisplayProperties,
	isGroup: boolean,
	isGhost: boolean,
	isSelected: boolean,
	customFill?: string,
	customBorder?: string
): InstanceDisplayStyle => {
	// Start with the default style
	const style: InstanceDisplayStyle = { ...properties.defaultStyle };

	// Apply custom colors last to override any default styles
	if (customFill) style.fill = customFill;
	if (customBorder) style.stroke = customBorder;

	// Create an array of style modifications to apply in order
	const styleModifications = [
		{ shouldApply: isGroup, style: properties.groupStyle },
		{ shouldApply: isGhost, style: properties.ghostStyle },
		{ shouldApply: isSelected, style: properties.selectedStyle },
	];

	// Apply each style modification in sequence if applicable
	for (const { shouldApply, style: styleToApply } of styleModifications) {
		if (shouldApply) {
			Object.assign(style, styleToApply);
		}
	}

	return style;
};
