import { ReactElement } from "react";
import { svgXML } from "../components/svgrenderer";
import Instance from "./types/Instance";
import Model from "./types/Model";

export default interface FEMState {
	models: Array<Model>;
	currentModel: Model | undefined;
	currentInstance: Instance | undefined;
	svgs: { [key: Model["name"]]: svgXML };
}

const initialState: FEMState = {
	models: [],
	currentModel: undefined,
	currentInstance: undefined,
	svgs: {},
};

export { initialState };
