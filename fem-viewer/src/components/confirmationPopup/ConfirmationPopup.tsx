import React, { CSSProperties, FC } from "react";
import Popup from "reactjs-popup";
import styles from "./confirmationPopup.module.css";

type Props = {
	showCondition: boolean;
	handleConfirm: () => void;
	toggleConfirmation: (value: boolean) => void;
};

const contentStyle: CSSProperties = {
	background: "rgb(255, 255, 255)",
	padding: "10px",
	border: "4px solid var(--bg-primary)",
	borderRadius: "10px 10px",
};

const overlayStyle: CSSProperties = {
	backgroundColor: "rgba(100, 100, 100, 0.5)",
};

const ConfirmationPopup: FC<Props> = ({
	showCondition,
	handleConfirm,
	toggleConfirmation,
}) => {
	return (
		<Popup
			open={showCondition}
			onClose={() => toggleConfirmation(false)}
			contentStyle={contentStyle}
			overlayStyle={overlayStyle}
		>
			<div>Are you sure you want to delete this model?</div>
			<div className={styles["btn-container"]}>
				<button
					className={styles["btn-confirm"]}
					onClick={handleConfirm}
				>
					Delete
				</button>
				<button
					className={styles["btn-close"]}
					onClick={() => toggleConfirmation(false)}
				>
					X
				</button>
			</div>
		</Popup>
	);
};

export default ConfirmationPopup;
