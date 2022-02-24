import React, { FC } from "react";
import SharedInstanceProps from "../../shared/SharedInstanceProps";
import Instance from "../../../state/types/Instance";
import styles from "./process.module.css";

interface Props extends SharedInstanceProps {}

const Process: FC<Props> = ({ instance, sharedStyles }) => {
	return (
		<div className={styles["process-container"]} style={sharedStyles}>
			<div>{instance.class}</div>
			<div>{instance.denomination}</div>
		</div>
	);
};

export default Process;
