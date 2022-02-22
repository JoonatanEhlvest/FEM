import React, { CSSProperties, FC, useEffect } from "react";
import Instance, { InstancePosition } from "../../state/types/Instance";
import ModelType from "../../state/types/Model";
import styles from "./model.module.css";

type Props = {
	model: ModelType;
	parentDimensions: DOMRectReadOnly | null;
};

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

const Model: FC<Props> = ({ model, parentDimensions }) => {
	return (
		<div key={model.id}>
			<div>{model.name}</div>
			{model.instances.map((i) => (
				<div
					className={styles["instance"]}
					style={getStyle(i)}
					onClick={() => console.log(i)}
				>
					<div>{i.name}</div>
				</div>
			))}
		</div>
	);
};

export default Model;
