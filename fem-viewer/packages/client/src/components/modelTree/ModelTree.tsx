import React, { CSSProperties, useEffect } from "react";

import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import styles from "./modelTree.module.css";

import { Model } from "@fem-viewer/types";

const ModelTree = () => {
	const {
		getModelTree,
		setCurrentModel,
		getCurrentModel,
		getCurrentModelGroup,
	} = useFEM();

	const isCurrentModelSelected = (model: Model): boolean => {
		return model.id === getCurrentModel()?.id;
	};

	const getClassIfSelected = (className: string, model: Model): string => {
		if (isCurrentModelSelected(model)) {
			return styles[className];
		}

		return "";
	};

	const getCurrentModelGroupName = () => {
		return getCurrentModelGroup()?.modelGroup.name.split("-")[0];
	};

	const models = getModelTree();

	useEffect(() => {
		try {
			setCurrentModel(models[0].id);
		} catch {}
	}, []);

	return (
		<div className={styles["model-tree-container"]}>
			<Header>
				<div>Model Tree: {getCurrentModelGroupName()}</div>
			</Header>
			<div className={styles["model-tree-content"]}>
				{models.map((model) => (
					<div
						className={styles["model-tree-item-container"]}
						key={model.id}
						onClick={() => {
							setCurrentModel(model.id);
						}}
					>
						<div
							className={
								styles["model-tree-item-pre"] +
								" " +
								getClassIfSelected("pre-selected", model)
							}
						></div>
						<p
							className={
								styles["model-tree-item"] +
								" " +
								getClassIfSelected("item-selected", model)
							}
						>
							{model.name}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default ModelTree;
