import { useContext } from "react";
import { addXMLAttrPrefix } from "../utlitity";
import FEMContext from "./FEMContext";
import FEMState from "./FEMState";
import Connector from "./types/Connector";
import InstancePosition from "./types/Instance";
import Instance, { INSTANCE_DEFAULTS } from "./types/Instance";
import InstanceClass from "./types/InstanceClass";
import Model from "./types/Model";
import ModelAttributes, { WorldArea } from "./types/ModelAttributes";

type XMLObj = {
	[key: string]: string | number | XMLObj;
};

const useFEM = () => {
	const [state, setState] = useContext(FEMContext);

	if (setState === undefined) {
		throw new Error(
			"setState undefined for FEMContext, check if you've provided a default setState value for FEMContext.Provider"
		);
	}

	const tryGetStrProperty = (jsonObj: XMLObj, attr: string): string => {
		const attrWithPrefix = addXMLAttrPrefix(attr);
		if (jsonObj[attrWithPrefix] !== undefined) {
			const value = jsonObj[attrWithPrefix];
			return String(value);
		} else {
			return "";
		}
	};

	const tryGetNumProperty = (jsonObj: XMLObj, attr: string): number => {
		const attrWithPrefix = "@_" + attr;
		if (jsonObj[attrWithPrefix] !== undefined) {
			const value = jsonObj[attrWithPrefix];
			return Number(value);
		} else {
			return 0;
		}
	};

	const tryGetBoolAttr = (XMLattribute: XMLObj, attr: string): boolean => {
		const attrWithPrefix = "@_" + attr;
		const value = XMLattribute[attrWithPrefix];
		if (value !== undefined && typeof value === "object") {
			return value["#text"] === "Yes" ? true : false;
		} else {
			return false;
		}
	};

	const tryGetStrAttr = (XMLattribute: XMLObj, attr: string): string => {
		const value = XMLattribute[attr];
		if (value !== undefined && typeof value === "object") {
			return value["#text"] as string;
		} else {
			return "";
		}
	};

	const tryGetNumAttr = (XMLattribute: XMLObj, attr: string): number => {
		const value = XMLattribute[attr];
		if (value !== undefined && typeof value === "object") {
			return Number(value["#text"]);
		} else {
			return INSTANCE_DEFAULTS.hasOwnProperty(attr)
				? Number(INSTANCE_DEFAULTS[attr])
				: 0;
		}
	};

	const findFloatsFromString = (s: string): number[] | undefined => {
		return s.match(/[+-]?\d+(\.\d+)?/g)?.map((f) => parseFloat(f));
	};

	const parseInstancePosition = (s: string): Instance["position"] => {
		const match = findFloatsFromString(s);
		if (match === undefined) {
			return undefined;
		}
		const ret: Instance["position"] = {
			x: match[0],
			y: match[1],
			width: match[2],
			height: match[3],
			index: match[4],
		};

		return ret;
	};

	const parseWorldArea = (s: string): ModelAttributes["worldArea"] => {
		const match = findFloatsFromString(s);
		if (match === undefined) {
			return undefined;
		}

		const ret: ModelAttributes["worldArea"] = {
			width: match[0],
			height: match[1],
			minWidth: match[2],
			minHeight: match[3],
		};

		return ret;
	};

	const getInstances = (instances: Array<XMLObj>): Array<Instance> => {
		const ret: Array<Instance> = instances.map((XMLInstance) => {
			const attributes = XMLInstance.ATTRIBUTE as XMLObj;
			const position = parseInstancePosition(
				tryGetStrAttr(attributes, "position")
			);
			const instance: Instance = {
				id: tryGetStrProperty(XMLInstance, "id"),
				class: tryGetStrProperty(XMLInstance, "class") as InstanceClass,
				name: tryGetStrProperty(XMLInstance, "name"),
				isGhost: tryGetBoolAttr(attributes, "isghost"),
				isGroup: tryGetBoolAttr(attributes, "isgroup"),
				position: position,
				applyArchetype: tryGetStrAttr(attributes, "applyArchetype"),
				description: tryGetStrAttr(attributes, "description"),
				fontSize: tryGetNumAttr(attributes, "fontsize"),
				fontStyle: tryGetStrAttr(attributes, "fontStyle"),
				individualBGColor: tryGetStrAttr(
					attributes,
					"individualbackgroundcolor"
				),
				individualGhostBGColor: tryGetStrAttr(
					attributes,
					"individualghostbackgroundcolort"
				),
				denomination: tryGetStrAttr(attributes, "denomination"),
				referencedDenomination: tryGetStrAttr(
					attributes,
					"referenceddenomination"
				),
			};
			return instance;
		});
		return ret;
	};

	const getConnectors = (connectors: Array<XMLObj>): Array<Connector> => {
		const ret: Array<Connector> = connectors.map((XMLconnector) => {
			const attributes = XMLconnector.ATTRIBUTE as XMLObj;
			const from = XMLconnector.FROM as XMLObj;
			const to = XMLconnector.TO as XMLObj;
			const connector: Connector = {
				id: tryGetStrProperty(XMLconnector, "id"),
				class: tryGetStrProperty(XMLconnector, "class"),
				fromId: tryGetStrProperty(from, "instance"),
				toId: tryGetStrProperty(to, "instance"),
				positions: tryGetStrAttr(attributes, "positions"),
				appearance: tryGetStrAttr(attributes, "appearance"),
				processType: tryGetStrAttr(attributes, "processtype"),
			};
			return connector;
		});
		return ret;
	};

	const getModelAttributes = (
		modelAttributes: XMLObj
	): Partial<ModelAttributes> => {
		const f = (s: string): string => tryGetStrAttr(modelAttributes, s);

		const worldArea = parseWorldArea(f("worldarea"));
		const ret: Partial<ModelAttributes> = {
			accessState: f("accessstate"),
			assetBGColor: f("assetbackgroundcolor"),
			assetGhostBGColor: f("assetghostbackgroundcolor"),
			assetGroupBGColor: f("assetgroupbackgroundcolor"),
			Author: f("author"),
			baseName: f("basename"),
			changeCounter: tryGetNumAttr(modelAttributes, "changecounter"),
			comment: f("comment"),
			connectorMarks: f("connectormarks"),
			contextOfVersion: f("contextofversion"),
			creationDate: f("creationdate"),
			currentMode: f("currentmode"),
			currentPageLayout: f("currentpagelayout"),
			lastChanged: f("datelastchanged"),
			description: f("description"),
			externalActorBGColor: f("externalactorbackgroundcolor"),
			externalActorGhostBGColor: f("externalactorghostbackgroundcolor"),
			externalActorGroupBGColor: f("externalactorgroupbackgroundcolor"),
			fontSize: tryGetNumAttr(modelAttributes, "fontsize"),
			lastUser: f("lastuser"),
			modelType: f("modeltype"),
			noteBGColor: f("notebackgroundcolor"),
			noteGhostBGColor: f("noteghostbackgroundcolor"),
			noteGroupBGColor: f("notegroupbackgroundcolor"),
			PoolBGColor: f("poolbackgroundcolor"),
			PoolGhostBGColor: f("poolghostbackgroundcolor"),
			PoolGroupBGColor: f("poolgroupbackgroundcolor"),
			position: f("position"),
			ProcessBGColor: f("processbackgroundcolor"),
			ProcessGhostBGColor: f("processghostbackgroundcolor"),
			ProcessGroupBGColor: f("processgroupbackgroundcolor"),
			state: f("state"),
			type: f("type"),
			worldArea: worldArea,
			viewableArea: f("viewablearea"),
			zoom: tryGetNumAttr(modelAttributes, "zoom"),
		};

		return ret;
	};

	const addModel = (model: any) => {
		const modelToAdd: Model = {
			id: tryGetStrProperty(model, "id"),
			applib: tryGetStrProperty(model, "applib"),
			modeltype: tryGetStrProperty(model, "modeltype"),
			name: tryGetStrProperty(model, "name"),
			version: tryGetStrProperty(model, "version"),
			libtype: tryGetStrProperty(model, "libtype"),
			connectors: getConnectors(model.CONNECTOR),
			instances: getInstances(model.INSTANCE),
			attributes: getModelAttributes(model.MODELATTRIBUTES),
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

	const getCurrentInstance = (): Instance | undefined => {
		return state.currentInstance;
	};

	const setCurrentInstance = (instance: Instance) => {
		if (instance.id === getCurrentInstance()?.id) {
			return;
		}
		setState((prevState) => ({
			...prevState,
			currentInstance: instance,
		}));
	};

	return {
		getModelTree,
		addModel,
		getCurrentModel,
		setCurrentModel,
		getCurrentInstance,
		setCurrentInstance,
	};
};

export default useFEM;
