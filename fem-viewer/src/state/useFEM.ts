import { useContext } from "react";
import FEMContext from "./FEMContext";
import FEMState from "./FEMState";
import Connector from "./types/Connector";
import Instance from "./types/Instance";
import Model from "./types/Model";

type XMLObj = {
	[key: string]: string | number;
};

const useFEM = () => {
	const [state, setState] = useContext(FEMContext);

	if (setState === undefined) {
		throw new Error(
			"setState undefined for FEMContext, check if you've provided a default setState value for FEMContext.Provider"
		);
	}

	const tryGetStrAttr = (jsonObj: XMLObj, attr: string): string => {
		const attrWithPrefix = "@_" + attr;
		if (jsonObj[attrWithPrefix] !== undefined) {
			const value = jsonObj[attrWithPrefix];
			return String(value);
		} else {
			return "";
		}
	};

	const tryGetNumAttr = (jsonObj: XMLObj, attr: string): number => {
		const attrWithPrefix = "@_" + attr;
		if (jsonObj[attrWithPrefix] !== undefined) {
			const value = jsonObj[attrWithPrefix];
			return Number(value);
		} else {
			return 0;
		}
	};

	const getInstances = (instances: Array<XMLObj>): Array<Instance> => {
		instances.forEach((XMLInstance) => {
			// const instance: Instance = {
			// 	id: tryGetStrAttr(XMLInstance, "id"),
			// 	fontSize: tryGetNumAttr(XMLInstance, "fontSize"),
			// };
		});
		return [];
	};

	const getConnectors = (connectors: Array<XMLObj>): Array<Connector> => {
		return [];
	};

	const addModel = (model: any) => {
		const modelToAdd: Model = {
			id: tryGetStrAttr(model, "id"),
			applib: tryGetStrAttr(model, "applib"),
			modeltype: tryGetStrAttr(model, "modeltype"),
			name: tryGetStrAttr(model, "name"),
			version: tryGetStrAttr(model, "version"),
			libtype: tryGetStrAttr(model, "libtype"),
			connectors: getConnectors(model.CONNECTOR),
			instances: getInstances(model.INSTANCE),
		};
		setState((prevState) => {
			return {
				...prevState,
				models: [...prevState.models, modelToAdd],
			};
		});
	};

	const getModelTree = (): FEMState["models"] => {
		return state.models;
	};

	const getCurrentModel = (): Model | undefined => {
		return state.currentModel;
	};

	const setCurrentModel = (id: Model["id"]) => {
		if (id === getCurrentModel()?.id) {
			return;
		}
		setState((prevState) => ({
			...prevState,
			currentModel: state.models.find((m) => m.id === id),
		}));
	};

	return {
		getModelTree,
		addModel,
		getCurrentModel,
		setCurrentModel,
	};
};

export default useFEM;
