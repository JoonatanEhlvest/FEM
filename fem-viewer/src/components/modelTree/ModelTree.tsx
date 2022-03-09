import React, { useState } from "react";
import { Resizable, ResizeCallbackData } from "react-resizable";
import useFEM from "../../state/useFEM";
import styles from "./modelTree.module.css";

const ModelTree = () => {
	const { getModelTree, setCurrentModel, setCurrentSvgElement } = useFEM();
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

	return (
		<div>
			<Resizable
				width={0}
				height={state.height}
				handle={<div className={styles["model-tree-handle"]}></div>}
				onResize={onResize}
			>
				<div
					className={styles["model-tree-container"]}
					style={{ height: state.height }}
				>
					{getModelTree().map((model) => (
						<div key={model.id}>
							<p onClick={() =>  {
								setCurrentModel(model.id)
								setCurrentSvgElement(model.name)
								}} >
								{model.name}
							</p>
						</div>
					))}
				</div>
			</Resizable>
		</div>
	);
};

export default ModelTree;
