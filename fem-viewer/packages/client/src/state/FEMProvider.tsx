import { useState } from "react";
import FEMContext from "./FEMContext";
import FEMState from "./FEMState";

type Props = {
	children?: React.ReactNode;
	preloadedState: FEMState;
};

const FEMProvider = (props: Props) => {
	const [state, setState] = useState<FEMState>(props.preloadedState);

	return (
		<FEMContext.Provider value={[state, setState]}>
			{props.children}
		</FEMContext.Provider>
	);
};

export default FEMProvider;
