import axios from "axios";
import FEMState from "../state/FEMState";

export const checkLoggedIn = async (initialState: FEMState) => {
	const response = await axios.get("/api/v1/session");
	const { user } = response.data;

	if (user) {
		return {
			...initialState,
			user,
		};
	}

	return initialState;
};
