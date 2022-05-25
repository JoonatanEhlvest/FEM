import React, { FC, useEffect, useState } from "react";
import http from "../../http";
import { User } from "../../state/FEMState";
import useFEM from "../../state/useFEM";
import ConfirmationPopup from "../confirmationPopup/ConfirmationPopup";
import CreatedUserListItem from "./CreatedUserListItem";
import { UserRole } from "./Dashboard";
import styles from "./dashboard.module.css";

type Props = {
	user: User;
};

export type CreatedUser = {
	id: string;
	username: string;
	role: UserRole;
};

const DashboardCreatedUsersList: FC<Props> = ({ user }) => {
	const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);

	const handleDelete = (toDeleteId: CreatedUser["id"]) => {
		setCreatedUsers((prev) => prev.filter((u) => u.id !== toDeleteId));
	};

	useEffect(() => {
		http.get(`/api/v1/user/created/${user.id}`).then((res) => {
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
							<CreatedUserListItem
								key={`created-${u.id}`}
								createdUser={u}
								deleteCallback={handleDelete}
							/>
						);
					})}
			</div>
		</div>
	);
};

export default DashboardCreatedUsersList;
