import React, { FC } from "react";
import FEMState from "../../state/FEMState";
import styles from "./applicationError.module.css";

type Props = {
	error: NonNullable<FEMState["error"]>;
	handleClose: () => void;
};

const ApplicationError: FC<Props> = ({ error, handleClose }) => {
	return (
		<div className={styles["error-container"]}>
			<h3>Error</h3>
			<div>Status: {error.status}</div>
			<div>{error.message}</div>
			<button onClick={handleClose}>X</button>
		</div>
	);
};

export default ApplicationError;
