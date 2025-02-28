import React, { FC } from "react";
import FEMState from "../../state/FEMState";
import styles from "./popUp.module.css";

type Props = {
	popUp: NonNullable<FEMState["popUp"]>;
	handleClose: () => void;
};

const Popup: FC<Props> = ({ popUp, handleClose }) => {
	return (
		<div className={styles["container"]}>
			<h3>Success</h3>

			<div>{popUp.message}</div>
			<button onClick={handleClose}>X</button>
		</div>
	);
};

export default Popup;
