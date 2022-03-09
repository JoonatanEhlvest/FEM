import { ReactElement } from "react";
import { svgXML } from "../components/svgrenderer/svgrenderer";
import Instance from "./types/Instance";
import Model from "./types/Model";

export default interface FEMState {
	models: Array<Model>;
	currentModel: Model | undefined;
	currentInstance: Instance | undefined;
	svgs: { [key: Model["name"]]: svgXML };
	currentSvgElement: ReactElement | undefined;
}

const initialState: FEMState = {
	models: [],
	currentModel: undefined,
	currentInstance: undefined,
	svgs: {},
	currentSvgElement: undefined,
};

export { initialState };
