import { useEffect, useState } from "react";
import FEMContext from "./FEMContext";
import FEMState, { initialState } from "./FEMState";

type Props = {
	children?: React.ReactNode;
};

const FEMProvider = (props: Props) => {
	const [state, setState] = useState<FEMState>(initialState);

	return (
		<FEMContext.Provider value={[state, setState]}>
			{props.children}
		</FEMContext.Provider>
	);
};

export default FEMProvider;
