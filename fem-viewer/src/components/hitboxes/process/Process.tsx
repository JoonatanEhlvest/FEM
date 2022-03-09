import React, { CSSProperties, FC } from "react";
import SharedInstanceProps from "../../shared/SharedInstanceProps";
import styles from "./process.module.css";

interface Props extends SharedInstanceProps {}

const Process: FC<Props> = ({ instance, sharedStyles }) => {
	const applyIndividulStyles = (shared: CSSProperties): CSSProperties => {
		let borderRadius = "50% 50%";
		if (instance.isGroup) {
			borderRadius = "5px";
		}
		return {
			...shared,
			borderRadius,
		};
	};

	return (
		<div
			className={styles["process-container"]}
			style={applyIndividulStyles(sharedStyles)}
		></div>
	);
};

export default Process;
