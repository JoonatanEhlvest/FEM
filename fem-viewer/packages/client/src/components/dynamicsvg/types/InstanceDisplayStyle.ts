export interface InstanceDisplayStyle {
	fill: string;
	stroke: string;
	strokeWidth: number;
	strokeDasharray?: string;
	opacity?: number;
	filter?: string;
	textWidthPadding?: number; // Padding to reduce available width for text wrapping
}
