import { Instance, Model } from "@fem-viewer/types";

/**
 * Props interface for instance renderers
 */
export interface InstanceRendererProps {
	instance: Instance;
	model: Model;
	onClick: () => void;
	isSelected: boolean;
	zoom: number;
	allOccurrencesHighlightedInstances?: string[]; // Array of instance IDs that are highlighted
}
