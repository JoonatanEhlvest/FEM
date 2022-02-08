import React from "react";
import useFEM from "../state/useFEM";

const ModelTree = () => {
	const { count, title } = useFEM();
	return (
		<div>
			<h1>{title}</h1>
			<p>same count: {count}</p>
		</div>
	);
};

export default ModelTree;
