import React, { FC, useEffect, useState } from "react";
import http from "../../http";
import { User } from "../../state/FEMState";
import useFEM from "../../state/useFEM";
import ConfirmationPopup from "../confirmationPopup/ConfirmationPopup";
import styles from "./dashboard.module.css";

type Props = {
	user: User;
};

type CreatedUser = {
	username: string;
};

const DashboardCreatedUsersList: FC<Props> = ({ user }) => {
	const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = () => {};

	useEffect(() => {
		http.get(`/api/v1/user/created/${user.id}`).then((res) => {
			console.log(res);
			setCreatedUsers(res.data.users);
		});
	}, []);

	return (
		<div className={styles["modelgrouplist-container"]}>
			<div className={styles["modelgrouplist-header"]}>
				Users you have created
			</div>

			<div className={styles["modelgrouplist-list-container"]}>
				{createdUsers &&
					createdUsers.map((u) => {
						return (
							<div
								className={styles["modelgroup-item-container"]}
							>
								<div
									className={
										styles["modelgroup-left-container"]
									}
								>
									<div style={{ padding: "10px" }}>
										Username: {u.username}
									</div>
								</div>
								<div
									className={
										styles["modelgroup-right-container"]
									}
								>
									<button
										onClick={() =>
											setShowConfirmation(true)
										}
									>
										Delete
									</button>
								</div>
								<div>
									<ConfirmationPopup
										message={`Are you sure you want to delete ${u.username} ?`}
										showCondition={showConfirmation}
										handleConfirm={handleDelete}
										toggleConfirmation={setShowConfirmation}
									/>
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default DashboardCreatedUsersList;
