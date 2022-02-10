import React from "react";
import useFEM from "../../state/useFEM";
import styles from "./modelTree.module.css";

const ModelTree = () => {
	const { getModelTree, setCurrentModel } = useFEM();

	return (
		<div className={styles["model-tree-container"]}>
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
