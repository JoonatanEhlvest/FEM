import React, { CSSProperties, useState } from "react";
import { Resizable, ResizeCallbackData } from "react-resizable";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import styles from "./modelTree.module.css";
import sharedStyles from "../../utlitity/sharedStyles.module.css";
import Model from "../../state/types/Model";

const itemPreStylesIfSelected: CSSProperties = {
	backgroundColor: "blue",
};

const itemStylesIfSelected: CSSProperties = {
	textDecoration: "underline",
};

const ModelTree = () => {
	const { getModelTree, setCurrentModel, getCurrentModel } = useFEM();

	const [state, setState] = useState(() => {
		return {
			height: 0.75 * window.innerHeight,
		};
	});

	const onResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
		setState((prevState) => {
			return {
				...prevState,
				height: data.size.height,
			};
		});
	};

	const isCurrentModelSelected = (model: Model): boolean => {
		return model.id === getCurrentModel()?.id;
	};

	const getClassIfSelected = (className: string, model: Model): string => {
		if (isCurrentModelSelected(model)) {
			return styles[className];
		}

		return "";
	};

	return (
		<div>
			<div
				className={styles["model-tree-container"]}
				style={{ height: state.height }}
			>
				<Header>
					<div>Model Tree</div>
				</Header>
				<div className={styles["model-tree-content"]}>
					{getModelTree().map((model) => (
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
		</div>
	);
};

export default ModelTree;
