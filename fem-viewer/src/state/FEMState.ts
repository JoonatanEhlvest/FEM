import Model from "./types/Model";

export default interface FEMState {
	models: Array<Model>;
	currentModel: Model | undefined;
}

const initialState: FEMState = {
	models: [],
	currentModel: undefined,
};

export { initialState };
