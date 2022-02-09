import React from "react";
import useFEM from "../state/useFEM";

const Viewer = () => {
	const { getCurrentModel } = useFEM();

	const model = getCurrentModel();

	return <div>Current Model: {model && <div>{model.name}</div>}</div>;
};

export default Viewer;
