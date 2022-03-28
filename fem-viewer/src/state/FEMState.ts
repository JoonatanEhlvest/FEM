import { ReactElement } from "react";
import { svgXML } from "../components/svgrenderer/svgrenderer";
import Instance from "./types/Instance";
import Model from "./types/Model";

export interface User {
	id: string;
}

export default interface FEMState {
	models: Array<Model>;
	currentModel: Model | undefined;
	currentInstance: Instance | undefined;
	svgs: { [key: Model["name"]]: svgXML };
	currentSvgElement: svgXML | undefined;
	zoom: number;
	error: {
		status: number;
		message: string;
	} | null;
	user: User | null;
	referencedBy: {
		[key: Instance["name"]]: {
			modelName: Model["name"];
			instanceName: Instance["name"];
		}[];
	};
}

const initialState: FEMState = {
	models: [],
	currentModel: undefined,
	currentInstance: undefined,
	svgs: {},
	currentSvgElement: undefined,
	zoom: 1,
	error: null,
	user: null,
	referencedBy: {},
};

export { initialState };
