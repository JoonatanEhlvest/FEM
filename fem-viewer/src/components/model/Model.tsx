import React, { CSSProperties, FC, useEffect } from "react";
import Instance, { InstancePosition } from "../../state/types/Instance";
import InstanceClass from "../../state/types/InstanceClass";
import ModelType from "../../state/types/Model";
import Asset from "../asset/Asset";
import Pool from "../pool/Pool";
import Process from "../../process/Process";
import styles from "./model.module.css";
import useFEM from "../../state/useFEM";

type Props = {
	model: ModelType;
	parentDimensions: DOMRectReadOnly | null;
};

// Position instances and apply shared styles
// FIXME: Apply positions relative to the model worldArea and parent size
const getStyle = (i: Instance): CSSProperties => {
	const cmToPx = 37.7952755906;
	if (i.position) {
		const left = i.position.x * cmToPx;
		const top = i.position.y * cmToPx;
		const width = i.position.width * cmToPx;
		const height = i.position.height * cmToPx;

		return {
			left,
			top,
			width,
			height,
			fontSize: i.fontSize,
		};
	}
	return {};
};

// FIXME: Rendering for referenced instances
const renderInstanceType = (instance: Instance) => {
	switch (instance.class) {
		case "Pool":
			return <Pool instance={instance} />;
		case "Process":
			return <Process instance={instance} />;
		case "Asset":
			return <Asset instance={instance} />;
		default:
			return <div>Unknown class</div>;
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
		<div key={model.id}>
			<div>{model.name}</div>
			{model.instances.map((i) => (
				<div
					className={styles["instance"]}
					style={getStyle(i)}
					onClick={() => setCurrentInstance(i)}
				>
					{renderInstanceType(i)}
				</div>
			))}
		</div>
	);
};

export default Model;
