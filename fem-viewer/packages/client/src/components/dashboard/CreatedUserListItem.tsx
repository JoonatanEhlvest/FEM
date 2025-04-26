import React, { FC, useState } from "react";
import http from "../../http";
import ConfirmationPopup from "../confirmationPopup/ConfirmationPopup";
import { CreatedUser } from "./DashboardCreatedUsersList";
import styles from "./dashboard.module.css";
import useFEM from "../../state/useFEM";
import ChangeCreatedUserPasswordPopup from "../changeCreatedUserPasswordPopup/ChangeCreatedUserPasswordPopup";

type Props = {
	createdUser: CreatedUser;
	deleteCallback: (toDeleteId: CreatedUser["id"]) => void;
};

const CreatedUserListItem: FC<Props> = ({ createdUser, deleteCallback }) => {
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [showPasswordPopup, setShowPasswordPopup] = useState(false);
	const { removeSharesToUser } = useFEM();
	const handleDelete = () => {
		http.delete(`/api/v1/user/created/${createdUser.id}`)
			.then((res) => {
				removeSharesToUser(createdUser.username);
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
				<button
					onClick={() => setShowPasswordPopup(true)}
					className={styles["change-password-btn"]}
				>
					Change Password
				</button>
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
			<ChangeCreatedUserPasswordPopup
				createdUser={createdUser}
				isOpen={showPasswordPopup}
				onClose={() => setShowPasswordPopup(false)}
			/>
		</div>
	);
};

export default CreatedUserListItem;
