import { UserRole } from "../components/dashboard/Dashboard";
import { svgXML } from "../components/svgrenderer/svgrenderer";
import Instance, { InterrefType } from "./types/Instance";
import Model from "./types/Model";
import Reference from "./types/Reference";

export interface ModelGroup {
	modelGroup: {
		id: string;
		name: string;
		shares: {
			modelGroupId: string;
			sharedByName: string;
			sharedToName: string;
		}[];
	};
	owner: boolean;
}

export interface User {
	id: string;
	username: string;
	role: UserRole;
	modelGroups: ModelGroup[];
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
	references: {
		[key in InterrefType]: Reference[];
	};
	popUp: {
		message: string;
	} | null;
	allOccurrencesHighlightedInstances: Instance["id"][];
	referenceBackNavigation: {
		modelToGoTo: Model;
		instanceToGoTo: Instance;
	} | null;
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
	references: {
		"Referenced Bsubclass": [],
		"Referenced External Actor": [],
		"Referenced Subclass": [],
		"Referenced Pool": [],
		referencedAsset: [],
		referencedNote: [],
		referencedProcess: [],
	},
	popUp: null,
	allOccurrencesHighlightedInstances: [],
	referenceBackNavigation: null,
};

export { initialState };
