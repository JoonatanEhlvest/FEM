import { useContext } from "react";
import FEMContext from "./FEMContext";
import FEMState, { initialState, ModelGroup } from "./FEMState";

import { Model } from "@fem-viewer/types";

import { svgXML } from "../components/svgrenderer/svgrenderer";
import { Reference } from "@fem-viewer/types";
import http from "../http";
import { Instance, InterrefType } from "@fem-viewer/types/Instance";
import { InstanceClass } from "@fem-viewer/types";
import { UserRole } from "../components/dashboard/Dashboard";

const useFEM = () => {
	const [state, setState] = useContext(FEMContext);

	if (setState === undefined) {
		throw new Error(
			"setState undefined for FEMContext, check if you've provided a default setState value for FEMContext.Provider"
		);
	}

	const getReferences = (models: Model[]) => {
		models.forEach((model) => {
			model.instances.forEach((instance) => {
				Object.entries(instance.Interrefs).forEach(([key, iref]) => {
					if (iref) {
						const newRef: Reference = {
							type: iref.type,
							referencedClass: iref.tclassname as InstanceClass,
							modelName: iref.tmodelname,
							referencedInstanceName: iref.tobjname,
							referencedByInstance: instance.name,
							referencedByModel: model.name,
						};
						setState((prev) => ({
							...prev,
							references: {
								...prev.references,
								[key]: [
									...(prev.references[key as InterrefType] ||
										[]),
									newRef,
								],
							},
						}));
					}
				});
			});
		});
	};

	const addModelGroup = (modelGroup: ModelGroup, navigate: any) => {
		return http
			.get(`/api/v1/modelgroup/${modelGroup.modelGroup.id}`)
			.then((res) => {
				const svgs = res.data.data.svgs;
				svgs.forEach((svg: any) => {
					addSvg(svg.name, svg.data);
				});

				const models = res.data.data.models;

				setState((prevState: FEMState) => {
					return {
						...prevState,
						models: [...prevState.models, ...models],
						currentModelGroup: modelGroup,
					};
				});

				getReferences(models);

				navigate("/viewer");
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const addSvg = (name: string, svg: svgXML) => {
		setState((prevState: FEMState) => {
			return {
				...prevState,
				svgs: { ...prevState.svgs, [name]: svg },
			};
		});
	};

	const getModelTree = (): FEMState["models"] => {
		return state.models.sort((a, b) => a.name.localeCompare(b.name));
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
			setState((prevState: FEMState) => ({
				...prevState,
				currentModel: newModel,
			}));

			setCurrentSvgElement(newModel);
		}
	};

	const getCurrentInstance = (): FEMState["currentInstance"] => {
		return state.currentInstance;
	};

	const setCurrentInstance = (instance: FEMState["currentInstance"]) => {
		if (instance?.id === getCurrentInstance()?.id) {
			return;
		}
		setState((prevState: FEMState) => ({
			...prevState,
			currentInstance: instance,
		}));
	};

	const setInstanceAllOccurrencesHighlighting = (
		instance: Instance,
		value: boolean
	) => {
		setState((prevState: FEMState) => ({
			...prevState,
			allOccurrencesHighlightedInstances: [
				...prevState.allOccurrencesHighlightedInstances,
				instance.id,
			],
		}));
	};

	const clearAllOccurrencesHighlighting = () => {
		setState((prevState: FEMState) => ({
			...prevState,
			allOccurrencesHighlightedInstances: [],
		}));
	};

	const getCurrentSvgElement = (): FEMState["currentSvgElement"] => {
		return state.currentSvgElement;
	};

	const setCurrentSvgElement = (model: Model) => {
		if (model.name === getCurrentModel()?.name) {
			return;
		}
		let svg = getModelSvg(model.name);
		if (svg === undefined && model.attributes.baseName) {
			svg = getModelSvg(model.attributes.baseName);
		}
		setState((prevState: FEMState) => ({
			...prevState,
			currentSvgElement: svg,
		}));
	};

	const setReferenceBackNavigation = (
		referenceBackNavigation: FEMState["referenceBackNavigation"]
	) => {
		setState((prevState: FEMState) => ({
			...prevState,
			referenceBackNavigation,
		}));
	};

	const getReferenceBackNavigation = () => {
		return state.referenceBackNavigation;
	};

	const goToReference = (reference: Reference) => {
		const models = state.models;
		const referencedModel = models.find(
			(m) => m.name === reference.referencedByModel
		);
		if (referencedModel) {
			const referencedInstance = referencedModel.instances.find(
				(i) =>
					i.name === reference.referencedByInstance &&
					i.class === reference.referencedClass
			);
			setCurrentModel(referencedModel.id);

			if (referencedInstance) {
				setCurrentInstance(undefined);
				setCurrentInstance(referencedInstance);
				setReferenceBackNavigation({
					modelToGoTo: referencedModel,
					instanceToGoTo: referencedInstance,
				});
			}
		}
	};

	const goToAllOccurrences = (
		refModelName: Model["name"],
		references: Reference[]
	) => {
		const models = state.models;
		const referencedModel = models.find((m) => m.name === refModelName);
		if (referencedModel) {
			const referencedInstances = [];
			referencedModel.instances.forEach((instance) => {
				references.forEach((ref) => {
					if (ref.referencedByInstance === instance.name) {
						setInstanceAllOccurrencesHighlighting(instance, true);
					}
				});
			});

			setCurrentModel(referencedModel.id);
		}
	};

	const getModelSvg = (
		modelName: string
	): FEMState["svgs"][keyof FEMState["svgs"]] => {
		return state.svgs[modelName];
	};

	const setZoom = (zoom: number) => {
		setState((prevState: FEMState) => ({
			...prevState,
			zoom,
		}));
	};

	const getZoom = (): FEMState["zoom"] => {
		return state.zoom;
	};

	const setError = (error: FEMState["error"]) => {
		setState((prevState: FEMState) => ({
			...prevState,
			error,
		}));
	};

	const getError = (): FEMState["error"] => {
		return state.error;
	};

	const login = (username: string, password: string) => {
		http.post("/api/v1/login", { username, password })
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
		http.delete("/api/v1/logout")
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

	const register = (username: string, password: string, role: UserRole) => {
		return http
			.post("/api/v1/register", { username, password, role })
			.then((res) => {
				setPopup({ message: `User '${res.data.username}' created` });
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const tryAutoLogin = () => {
		http.get("/api/v1/session")
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

	const getUser = () => state.user;

	const fetchUser = () => {
		if (!state.user) return Promise.reject("User not logged in");
		return http.get(`/api/v1/user/${state.user.id}`);
	};

	const fetchModelGroups = () => {
		if (!state.user) return Promise.reject("User not logged in");
		http.get(`/api/v1/user/${state.user.id}`).then((res) => {
			setState((prevState: FEMState) => {
				if (!prevState.user) return prevState;
				return {
					...prevState,
					user: {
						...prevState.user,
						modelGroups: res.data.user.modelGroups,
					},
				};
			});
		});
	};

	const removeModelGroup = (idToRemove: ModelGroup["modelGroup"]["id"]) => {
		setState((prevState: FEMState) => {
			if (prevState.user) {
				return {
					...prevState,
					user: {
						...prevState.user,
						modelGroups: prevState.user?.modelGroups.filter(
							(m) => m.modelGroup.id !== idToRemove
						),
					},
				};
			}
			return prevState;
		});
	};

	const resetModels = () => {
		setState((prev) => ({
			...prev,
			svgs: initialState.svgs,
			models: initialState.models,
			currentInstance: undefined,
			currentModel: undefined,
			currentSvgElement: undefined,
			references: initialState.references,
		}));
	};

	const setPopup = (popUp: FEMState["popUp"]) => {
		setState((prevState: FEMState) => ({
			...prevState,
			popUp,
		}));
	};

	const getPopup = (): FEMState["popUp"] => {
		return state.popUp;
	};

	const getInstancesThatReference = (
		instance: Instance,
		refType: InterrefType
	): Reference[] => {
		return state.references[refType].filter((ref) => {
			if (
				ref.referencedByInstance === instance.name &&
				ref.referencedByModel === getCurrentModel()?.name
			)
				return false;
			return (
				ref.referencedInstanceName === instance.name &&
				ref.referencedClass === instance.class
			);
		});
	};

	const getCurrentModelGroup = () => {
		return state.currentModelGroup;
	};

	const removeShare = (
		modelGroupId: ModelGroup["modelGroup"]["id"],
		sharedToName: string
	) => {
		setState((prevState: FEMState) => {
			if (!prevState.user) {
				return prevState;
			}
			return {
				...prevState,
				user: {
					...prevState.user,
					modelGroups: prevState.user.modelGroups.map((m) => {
						if (m.modelGroup.id !== modelGroupId) return m;

						return {
							...m,
							modelGroup: {
								...m.modelGroup,
								shares: m.modelGroup.shares.filter(
									(s) => s.sharedToName !== sharedToName
								),
							},
						};
					}),
				},
			};
		});
	};

	const addShare = (share: ModelGroup["modelGroup"]["shares"][0]) => {
		setState((prevState: FEMState) => {
			if (!prevState.user) return prevState;
			return {
				...prevState,
				user: {
					...prevState.user,
					modelGroups: prevState.user.modelGroups.map((m) => {
						if (m.modelGroup.id !== share.modelGroupId) return m;
						return {
							...m,
							modelGroup: {
								...m.modelGroup,
								shares: [...m.modelGroup.shares, share],
							},
						};
					}),
				},
			};
		});
	};

	const removeSharesToUser = (sharedToName: string) => {
		setState((prevState: FEMState) => {
			if (!prevState.user) return prevState;

			return {
				...prevState,
				user: {
					...prevState.user,
					modelGroups: prevState.user.modelGroups.map((m) => ({
						...m,
						modelGroup: {
							...m.modelGroup,
							shares: m.modelGroup.shares.filter(
								(s) => s.sharedToName !== sharedToName
							),
						},
					})),
				},
			};
		});
	};

	const updateInstanceDescription = async (
		modelGroupId: string,
		instanceId: string,
		description: string
	) => {
		try {
			const response = await http.patch(
				`/api/v1/modelgroup/${modelGroupId}/instance/${instanceId}/description`,
				{ description }
			);
			
			if (response.data && response.data.models) {
				setState((prevState: FEMState) => {
					const updatedModels = response.data.models;
					
					// Find the updated instance
					let updatedCurrentInstance = prevState.currentInstance;
					if (prevState.currentInstance && prevState.currentInstance.id === instanceId) {
						for (const model of updatedModels) {
							const instance = model.instances.find(
								(inst: Instance) => inst.id === instanceId
							);
							if (instance) {
								updatedCurrentInstance = instance;
								break;
							}
						}
					}
					
					// Find the updated current model
					let updatedCurrentModel = prevState.currentModel;
					if (prevState.currentModel) {
						const updatedModel = updatedModels.find(
							(m: Model) => m.id === prevState.currentModel?.id
						);
						if (updatedModel) {
							updatedCurrentModel = updatedModel;
						}
					}
					
					return {
						...prevState,
						models: updatedModels,
						currentInstance: updatedCurrentInstance,
						currentModel: updatedCurrentModel
					};
				});
				
				return { success: true };
			}
			
			return { success: false, error: "No models returned from server" };
		} catch (error: any) {
			console.error("Error updating instance description:", error);
			return { 
				success: false, 
				error: error.response?.data?.message || "Failed to update description" 
			};
		}
	};

	return {
		getModelTree,
		addModelGroup,
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
		resetModels,
		setPopup,
		getPopup,
		getInstancesThatReference,
		goToAllOccurrences,
		clearAllOccurrencesHighlighting,
		getReferenceBackNavigation,
		setReferenceBackNavigation,
		getUser,
		removeModelGroup,
		fetchModelGroups,
		getCurrentModelGroup,
		removeShare,
		addShare,
		removeSharesToUser,
		updateInstanceDescription,
		state,
	};
};

export default useFEM;
