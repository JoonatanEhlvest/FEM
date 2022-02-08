export default interface FEMState {
	count: number;
	title: string;
}

const initialState: FEMState = {
	count: 0,
	title: "FEM viewer",
};

export { initialState };
