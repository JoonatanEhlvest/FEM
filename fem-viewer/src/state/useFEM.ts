import { useContext } from "react";
import FEMContext from "./FEMContext";
import FEMState from "./FEMState";
import Connector from "./types/Connector";
import Instance from "./types/Instance";
import Model from "./types/Model";

const useFEM = () => {
	const [state, setState] = useContext(FEMContext);

	if (setState === undefined) {
		throw new Error(
			"setState undefined for FEMContext, check if you've provided a default setState value for FEMContext.Provider"
		);
	}

	const tryGetAttr = (jsonObj: { [key: string]: string }, attr: string) => {
		const attrWithPrefix = "@_" + attr;
		if (jsonObj[attrWithPrefix] !== undefined) {
			return jsonObj[attrWithPrefix];
		} else {
			return "";
		}
	};

	const getInstances = (instances: {
		[key: string]: string | number;
	}): Array<Instance> => {
		return [];
	};

	const getConnectors = (instances: {
		[key: string]: string | number;
	}): Array<Connector> => {
		return [];
	};

	const addModel = (model: any) => {
		const modelToAdd: Model = {
			id: tryGetAttr(model, "id"),
			applib: tryGetAttr(model, "applib"),
			modeltype: tryGetAttr(model, "modeltype"),
			name: tryGetAttr(model, "name"),
			version: tryGetAttr(model, "version"),
			libtype: tryGetAttr(model, "libtype"),
			connectors: getConnectors(model),
			instances: getInstances(model),
		};
		console.log(modelToAdd);
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
