import { useContext } from "react";
import { addXMLAttrPrefix } from "../utlitity";
import FEMContext from "./FEMContext";
import FEMState from "./FEMState";
import Connector from "./types/Connector";
import { ColorPicker } from "./types/Instance";
import Instance, { INSTANCE_DEFAULTS } from "./types/Instance";
import InstanceClass from "./types/InstanceClass";
import Model from "./types/Model";
import ModelAttributes from "./types/ModelAttributes";
import renderSVG, { svgXML } from "../components/svgrenderer/svgrenderer";
import Reference from "./types/Reference";
import axios from "axios";

type XMLObj = {
	[key: string]: string | number | XMLObj | XMLObj[];
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

	const hasTextProperty = (value: XMLObj[keyof XMLObj]): boolean => {
		return (
			value !== undefined &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			value["#text"] !== undefined
		);
	};

	const tryGetBoolAttr = (XMLattribute: XMLObj, attr: string): boolean => {
		const value = XMLattribute[attr];
		if (hasTextProperty(value)) {
			return (value as XMLObj)["#text"] === "Yes" ? true : false;
		} else {
			return false;
		}
	};

	const tryGetStrAttr = (XMLattribute: XMLObj, attr: string): string => {
		const value = XMLattribute[attr];
		if (hasTextProperty(value)) {
			return (value as XMLObj)["#text"] as string;
		} else {
			return "";
		}
	};

	const tryGetNumAttr = (XMLattribute: XMLObj, attr: string): number => {
		const value = XMLattribute[attr];
		if (hasTextProperty(value)) {
			return Number((value as XMLObj)["#text"]);
		} else {
			return INSTANCE_DEFAULTS.hasOwnProperty(attr)
				? Number(INSTANCE_DEFAULTS[attr])
				: 0;
		}
	};

	const findFloatsFromString = (s: string): number[] | undefined => {
		return s.match(/[+-]?([0-9]*[.])?[0-9]+/g)?.map((f) => parseFloat(f));
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

	const extractHexColor = (s: string): string => {
		const pattern = /val:"(\$?[a-zA-Z0-9]+)"/;
		const match = s.match(pattern);

		if (match == null || match.length < 2) {
			return "";
		}
		return match[1];
	};

	const findInstanceIREF = (refs: XMLObj): Instance["reference"] => {
		let returnReference: Instance["reference"] = null;
		if (Array.isArray(refs)) {
			let correctRef = null;
			for (let ref of refs) {
				if (ref["IREF"] !== undefined) {
					correctRef = ref["IREF"];
					break;
				}
			}

			if (correctRef !== null) {
				returnReference = {
					modelName: tryGetStrProperty(correctRef, "tmodelname"),
					type: tryGetStrProperty(correctRef, "type"),
					referencedInstanceName: tryGetStrProperty(
						correctRef,
						"tobjname"
					),
				};
			}
		}

		return returnReference;
	};

	const getInstanceReference = (instance: XMLObj): Instance["reference"] => {
		return findInstanceIREF(instance.INTERREF as XMLObj);
	};

	const getInstances = (instances: Array<XMLObj>): Array<Instance> => {
		const ret: Array<Instance> = instances.map((XMLInstance) => {
			const attributes = XMLInstance.ATTRIBUTE as XMLObj;
			const position = parseInstancePosition(
				tryGetStrAttr(attributes, "position")
			);

			const reference = getInstanceReference(XMLInstance);

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
					"individualghostbackgroundcolor"
				),
				referencedBGColor: extractHexColor(
					tryGetStrAttr(attributes, "referencedcolor")
				),
				referencedGhostBGColor: extractHexColor(
					tryGetStrAttr(attributes, "referencedghostcolor")
				),
				denomination: tryGetStrAttr(attributes, "denomination"),
				referencedDenomination: tryGetStrAttr(
					attributes,
					"referenceddenomination"
				),
				colorPicker: tryGetStrAttr(
					attributes,
					"colorpicker"
				) as ColorPicker,
				borderColor: tryGetStrAttr(attributes, "bordercolor"),
				reference,
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
			colors: {
				Asset: {
					ghost: f("assetghostbackgroundcolor"),
					group: f("assetgroupbackgroundcolor"),
					default: f("assetbackgroundcolor"),
				},
				Pool: {
					ghost: f("poolghostbackgroundcolor"),
					group: f("poolgroupbackgroundcolor"),
					default: f("poolbackgroundcolor"),
				},
				Process: {
					ghost: f("processghostbackgroundcolor"),
					group: f("processgroupbackgroundcolor"),
					default: f("processbackgroundcolor"),
				},
				Note: {
					ghost: f("noteghostbackgroundcolor"),
					group: f("notegroupbackgroundcolor"),
					default: f("notebackgroundcolor"),
				},
				"External Actor": {
					ghost: f("externalactorghostbackgroundcolor"),
					group: f("externalactorgroupbackgroundcolor"),
					default: f("externalactorbackgroundcolor"),
				},
			},

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

			position: f("position"),
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

	const addSvg = (name: string, svg: svgXML) => {
		setState((prevState) => {
			return {
				...prevState,
				svgs: { ...prevState.svgs, [name]: svg },
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

		const newModel = state.models.find((m) => m.id === id);
		if (newModel) {
			setState((prevState) => ({
				...prevState,
				currentModel: newModel,
			}));

			setCurrentSvgElement(newModel.name);
		}
	};

	const getCurrentInstance = (): FEMState["currentInstance"] => {
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

	const getCurrentSvgElement = (): FEMState["currentSvgElement"] => {
		return state.currentSvgElement;
	};

	const setCurrentSvgElement = (modelName: Model["name"]) => {
		if (modelName === getCurrentModel()?.name) {
			return;
		}
		const svg = getModelSvg(modelName);
		setState((prevState) => ({
			...prevState,
			currentSvgElement: svg,
		}));
	};

	const goToReference = (reference: Reference) => {
		const models = state.models;
		const referencedModel = models.find(
			(m) => m.name === reference.modelName
		);
		if (referencedModel) {
			const referencedInstance = referencedModel.instances.find(
				(i) => i.name === reference.referencedInstanceName
			);
			setCurrentModel(referencedModel.id);

			if (referencedInstance) {
				setCurrentInstance(referencedInstance);
			}
		}
	};

	const getModelSvg = (
		modelName: Model["name"]
	): FEMState["svgs"][keyof FEMState["svgs"]] => {
		return state.svgs[modelName];
	};

	const setZoom = (zoom: number) => {
		setState((prevState) => ({
			...prevState,
			zoom,
		}));
	};

	const getZoom = (): FEMState["zoom"] => {
		return state.zoom;
	};

	const setError = (error: FEMState["error"]) => {
		setState((prevState) => ({
			...prevState,
			error,
		}));
	};

	const getError = (): FEMState["error"] => {
		return state.error;
	};

	const login = (username: string, password: string) => {
		axios
			.post("/api/v1/login", { username, password })
			.then((res) => {
				setState((prev) => ({
					...prev,
					user: res.data.user,
				}));
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const logout = () => {
		axios
			.delete("/api/v1/logout")
			.then(() => {
				setState((prev) => ({
					...prev,
					user: null,
				}));
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const register = (username: string, password: string) => {
		axios
			.post("/api/v1/register", { username, password })
			.then((res) => {
				setState((prev) => ({
					...prev,
					user: res.data.user,
				}));
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const tryAutoLogin = () => {
		axios
			.get("/api/v1/session")
			.then((res) => {
				setState((prev) => ({
					...prev,
					user: res.data.user,
				}));
			})
			.catch((err) => {});
	};

	const isAuthenticated = () => {
		return state.user !== null;
	};

	const fetchUser = () => {
		return axios.get(`/api/v1/user/${state.user}`);
	};

	return {
		getModelTree,
		addModel,
		getCurrentModel,
		setCurrentModel,
		getCurrentInstance,
		setCurrentInstance,
		getModelSvg,
		addSvg,
		getCurrentSvgElement,
		goToReference,
		setZoom,
		getZoom,
		setError,
		getError,
		isAuthenticated,
		login,
		register,
		tryAutoLogin,
		logout,
		fetchUser,
	};
};

export default useFEM;
