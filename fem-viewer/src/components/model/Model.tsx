import React, { CSSProperties, FC } from "react";
import Instance from "../../state/types/Instance";
import ModelType from "../../state/types/Model";
import Asset from "../hitboxes/asset/Asset";
import Pool from "../hitboxes/pool/Pool";
import Process from "../hitboxes/process/Process";
import styles from "./model.module.css";
import useFEM from "../../state/useFEM";
import { getStyle } from "../../parser/preprocessing";
import Note from "../hitboxes/note/Note";

type Props = {
	model: ModelType;
	parentDimensions: DOMRectReadOnly | null;
};

// FIXME: Rendering for referenced instances
const renderInstanceType = (instance: Instance, model: ModelType) => {
	const sharedStyles: CSSProperties = getStyle(instance, model);

	switch (instance.class) {
		case "Pool":
			return <Pool instance={instance} sharedStyles={sharedStyles} />;
		case "Process":
			return <Process instance={instance} sharedStyles={sharedStyles} />;
		case "Asset":
			return <Asset instance={instance} sharedStyles={sharedStyles} />;
		case "Note":
			return <Note instance={instance} sharedStyles={sharedStyles} />;
		default:
			return <div style={sharedStyles}>Unknown class</div>;
	}
};

/**
 * This handles positioning of elements in the viewer.
 * renderInstanceType handles rendering of correct component based on instance class
 * Instance classes (Process, Asset, Pool etc.) are responsible for actually visualizing an instance.
 */
const Model: FC<Props> = ({ model, parentDimensions }) => {
	const { setCurrentInstance } = useFEM();
	return (
		<div key={model.id} className={styles["model-container"]}>
			{model.instances.map((i) => (
				<div
					key={i.id}
					className={styles["instance"]}
					onClick={() => {
						console.log(i);
						setCurrentInstance(i);
					}}
				>
					{renderInstanceType(i, model)}
				</div>
			))}
		</div>
	);
};

export default Model;
