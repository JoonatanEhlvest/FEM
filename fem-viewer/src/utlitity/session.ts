import FEMState from "../state/FEMState";
import http from "../http";

export const checkLoggedIn = async (initialState: FEMState) => {
	const response = await http.get("/api/v1/session");
	const { user } = response.data;

	if (user) {
		return {
			...initialState,
			user,
		};
	}

	return initialState;
};
