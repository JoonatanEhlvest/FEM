import React from "react";
import useFEM from "../state/useFEM";

const Viewer = () => {
	const { count, increment } = useFEM();
	return (
		<div>
			<p>count: {count}</p>
			<button onClick={increment}>+</button>
		</div>
	);
};

export default Viewer;
