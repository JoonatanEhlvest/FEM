import { useContext } from "react";
import FEMContext from "./FEMContext";

const useFEM = () => {
	const [state, setState] = useContext(FEMContext);
	if (setState === undefined) {
		throw new Error(
			"setState undefined for FEMContext, check if you've provided a default setState value for FEMContext.Provider"
		);
	}

	const increment = () => {
		setState((prevState) => ({
			...prevState,
			count: prevState.count + 1,
		}));
	};

	return {
		increment,
		count: state.count,
		title: state.title,
	};
};

export default useFEM;
