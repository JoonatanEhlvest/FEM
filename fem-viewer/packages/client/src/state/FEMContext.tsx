import React, { createContext } from "react";
import FEMState, { initialState } from "./FEMState";

type IFEMContext = [
	state: FEMState,
	setState?: React.Dispatch<React.SetStateAction<FEMState>>
];

const FEMContext = createContext<IFEMContext>([initialState]);

export default FEMContext;
