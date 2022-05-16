import { CSSProperties } from "react";
import FEMState from "../state/FEMState";
import Instance from "../state/types/Instance";
import Model from "../state/types/Model";

const DEFAULT_COLOR = "#ffc0cb";

// TODO: REMOVE
// Instance coloring, not needed anymore after using SVGs

// const DEFAULT_BORDER_COLOR = "#000000";

// const colorOrDefault = (color: string): string => {
// 	return color === "" ? DEFAULT_COLOR : color;
// };

// const getDefaultBgColor = (instance: Instance, model: Model): string => {
// 	if (isSubclass(instance)) {
// 		return DEFAULT_COLOR;
// 	}
// 	if (
// 		model.attributes.colors === undefined ||
// 		model.attributes.colors[instance.class as BaseInstanceClass] ===
// 			undefined
// 	) {
// 		return DEFAULT_COLOR;
// 	}

// 	const colors = model.attributes.colors[instance.class as BaseInstanceClass];

// 	if (instance.isGroup) {
// 		return colors.group;
// 	} else if (instance.isGhost) {
// 		return colors.ghost;
// 	} else {
// 		return colors.default;
// 	}
// };

// const getIndividualBgColor = (instance: Instance): string => {
// 	if (instance.isGhost) {
// 		return instance.individualGhostBGColor;
// 	}

// 	return instance.individualBGColor;
// };

// const getSubclassBgColor = (instance: Instance): string => {
// 	if (instance.isGhost) {
// 		return instance.referencedGhostBGColor;
// 	} else if (instance.referencedBGColor !== "") {
// 		return instance.referencedBGColor;
// 	}

// 	return getIndividualBgColor(instance);
// };

// const getBgColor = (instance: Instance, model: Model): string => {
// 	let ret = "";
// 	if (isSubclass(instance)) {
// 		ret = colorOrDefault(getIndividualBgColor(instance));
// 	} else {
// 		switch (instance.colorPicker) {
// 			case "Default":
// 				ret = colorOrDefault(getDefaultBgColor(instance, model));
// 				break;
// 			case "Individual":
// 				ret = colorOrDefault(getIndividualBgColor(instance));
// 				break;
// 			case "Subclass":
// 				ret = colorOrDefault(getSubclassBgColor(instance));
// 				break;
// 			default:
// 				return DEFAULT_COLOR;
// 		}
// 	}
// 	return ret.replace("$", "#");
// };

// const getBorderColor = (i: Instance): CSSProperties["borderColor"] => {
// 	if (i.borderColor === "") {
// 		return DEFAULT_BORDER_COLOR;
// 	}
// 	return i.borderColor;
// };

export const getTransform = (
	i: Instance,
	zoom: FEMState["zoom"]
): CSSProperties["transform"] => {
	let zoomAmount = -50 / zoom;
	if (i.class === "Note") {
		zoomAmount += 50;
	}

	return `scale(${zoom}) translate(${zoomAmount}%, ${zoomAmount}%)`;
};

const getCurrentInstanceStyles = (isCurr: boolean): CSSProperties => {
	if (isCurr) {
		return {
			border: "var(--bg-primary) 4px solid",
			boxShadow: "0px 0px 40px var(--bg-primary)",
			filter: "contrast(200%) saturate(150%)",
		};
	}

	return {};
};

const getAllOccurrencesHighlightingStyles = (
	allOccurrencesHighlightedInstances: FEMState["allOccurrencesHighlightedInstances"],
	instance: Instance
): CSSProperties => {
	if (allOccurrencesHighlightedInstances.find((id) => id === instance.id))
		return {
			border: "orange 4px solid",
			boxShadow: "0px 0px 40px orange",
			filter: "contrast(200%) saturate(150%)",
		};

	return {};
};

// Position instances and apply shared styles
// FIXME: Apply positions relative to the model worldArea and parent size
const getStyle = (
	i: Instance,
	model: Model,
	zoom: FEMState["zoom"],
	isCurrentInstance: boolean,
	allOccurrencesHighlightedInstances: FEMState["allOccurrencesHighlightedInstances"]
): CSSProperties => {
	// TODO: REMOVE
	// const backgroundColor = getBgColor(i, model);
	const cmToPx = 37.7952755906;

	let zIndex = 100;
	if (i.isGroup) zIndex -= 50;
	if (i.isGhost) zIndex -= 50;

	if (i.position) {
		const left = i.position.x * cmToPx * zoom;
		const top = i.position.y * cmToPx * zoom;
		const width = i.position.width * cmToPx;
		const height = i.position.height * cmToPx;

		let border: CSSProperties = {};

		let transformOrigin: CSSProperties = {};

		return {
			left,
			transform: getTransform(i, zoom),
			top,
			width,
			height,
			fontSize: i.fontSize,
			backgroundColor: "transparent",
			position: "inherit",
			zIndex,
			...border,
			...transformOrigin,
			...getCurrentInstanceStyles(isCurrentInstance),
			...getAllOccurrencesHighlightingStyles(
				allOccurrencesHighlightedInstances,
				i
			),
		};
	}
	return {};
};

export { getStyle, DEFAULT_COLOR };
