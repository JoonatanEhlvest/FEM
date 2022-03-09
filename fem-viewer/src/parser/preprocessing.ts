import { CSSProperties } from "react";
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

const getTransform = (i: Instance): CSSProperties["transform"] => {
	if (i.class === "Note") {
		return "";
	}

	return "translateX(-50%) translateY(-50%)";
};

// Position instances and apply shared styles
// FIXME: Apply positions relative to the model worldArea and parent size
const getStyle = (i: Instance, model: Model): CSSProperties => {
	// TODO: REMOVE
	// const backgroundColor = getBgColor(i, model);
	const cmToPx = 37.7952755906;

	let zIndex = 100;
	if (i.isGroup) zIndex -= 50;
	if (i.isGhost) zIndex -= 50;

	if (i.position) {
		const left = i.position.x * cmToPx;
		const top = i.position.y * cmToPx;
		const width = i.position.width * cmToPx;
		const height = i.position.height * cmToPx;
		return {
			left,
			transform: getTransform(i),
			top,
			width,
			height,
			fontSize: i.fontSize,
			backgroundColor: "transparent",
			zIndex,
			// borderColor: getBorderColor(i),
			borderColor: "rgb(255, 0, 160)",
			borderWidth: "3px",
			borderStyle: "solid",
			// width: "100%",
			// height: "100%",
			// top: 0,
			// left: 0,
			position: "inherit",
		};
	}
	return {};
};

export { getStyle, DEFAULT_COLOR };
