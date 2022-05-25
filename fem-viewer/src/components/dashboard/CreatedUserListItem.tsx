import React, { FC, useState } from "react";
import http from "../../http";
import ConfirmationPopup from "../confirmationPopup/ConfirmationPopup";
import { CreatedUser } from "./DashboardCreatedUsersList";
import styles from "./dashboard.module.css";

type Props = {
	createdUser: CreatedUser;
	deleteCallback: (toDeleteId: CreatedUser["id"]) => void;
};

const CreatedUserListItem: FC<Props> = ({ createdUser, deleteCallback }) => {
	const [showConfirmation, setShowConfirmation] = useState(false);
	const handleDelete = () => {
		http.delete(`/api/v1/user/created/${createdUser.id}`)
			.then((res) => {
				console.log(res);
				deleteCallback(res.data.user.id);
			})
			.catch((e) => console.log(e));
	};

	return (
		<div className={styles["modelgroup-item-container"]}>
			<div className={styles["modelgroup-left-container"]}>
				<div className={styles["created-left-item"]}>
					<p>Username: {createdUser.username}</p>
					<p>Role: {createdUser.role}</p>
				</div>
			</div>
			<div className={styles["modelgroup-right-container"]}>
				<button onClick={() => setShowConfirmation(true)}>
					Delete
				</button>
			</div>
			<ConfirmationPopup
				message={`Are you sure you want to delete ${createdUser.username} ?`}
				showCondition={showConfirmation}
				handleConfirm={handleDelete}
				toggleConfirmation={setShowConfirmation}
			/>
		</div>
	);
};

export default CreatedUserListItem;
