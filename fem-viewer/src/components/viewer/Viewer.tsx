import React from "react";
import useFEM from "../../state/useFEM";
import styles from "./viewer.module.css";

const Viewer = () => {
	const { getCurrentModel } = useFEM();

	const model = getCurrentModel();

	return (
		<div className={styles["viewer-container"]}>
			Current Model: {model && <div>{model.name}</div>}
		</div>
	);
};

export default Viewer;
