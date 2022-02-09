import React from "react";
import useFEM from "../state/useFEM";

const ModelTree = () => {
	const { getModelTree, setCurrentModel } = useFEM();

	return (
		<div>
			{getModelTree().map((model) => (
				<div>
					<p onClick={() => setCurrentModel(model.id)}>
						{model.name}
					</p>
				</div>
			))}
		</div>
	);
};

export default ModelTree;
