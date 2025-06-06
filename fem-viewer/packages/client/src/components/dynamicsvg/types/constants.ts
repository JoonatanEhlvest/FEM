// Conversion factor from centimeters to pixels
export const CM_TO_PX = 37.7952755906;
export const PT_TO_PX = 1.33333333333;

// Instance border stroke widths
const DEFAULT_BORDER_STROKE_WIDTH_CM = 0.04;
const CUSTOM_BORDER_STROKE_WIDTH_CM = 0.08;
export const DEFAULT_BORDER_STROKE_WIDTH_PX =
	DEFAULT_BORDER_STROKE_WIDTH_CM * CM_TO_PX;
export const CUSTOM_BORDER_STROKE_WIDTH_PX =
	CUSTOM_BORDER_STROKE_WIDTH_CM * CM_TO_PX;

// Connector appearance constants

const TRANSITIVE_DOUBLELINE_SPACING_CM = 0.05;
export const TRANSITIVE_DOUBLELINE_SPACING_PX =
	TRANSITIVE_DOUBLELINE_SPACING_CM * CM_TO_PX;

const TRANSITIVE_HIGHLIGHTED_STROKE_WIDTH_CM = 0.035;
export const TRANSITIVE_HIGHLIGHTED_STROKE_WIDTH_PX =
	TRANSITIVE_HIGHLIGHTED_STROKE_WIDTH_CM * CM_TO_PX;

const DEFAULT_CONNECTOR_STROKE_WIDTH_CM = 0.02;
export const DEFAULT_CONNECTOR_STROKE_WIDTH_PX =
	DEFAULT_CONNECTOR_STROKE_WIDTH_CM * CM_TO_PX;

const DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_CM = 0.04;
export const DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_PX =
	DEFAULT_BLUE_CONNECTOR_STROKE_WIDTH_CM * CM_TO_PX;

const HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_CM = 0.075;
export const HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_PX =
	HIGHLIGHTED_CONNECTOR_STROKE_WIDTH_CM * CM_TO_PX;
