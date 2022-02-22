import React, { FC } from "react";
import Instance from "../state/types/Instance";
import styles from "./process.module.css";

type Props = {
	instance: Instance;
};

const Process: FC<Props> = ({ instance }) => {
	return (
		<div className={styles["process-container"]}>
			<div>{instance.class}</div>
			<div>{instance.denomination}</div>
		</div>
	);
};

export default Process;
