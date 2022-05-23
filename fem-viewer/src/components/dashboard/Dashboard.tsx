import React, { useEffect, useState } from "react";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import DashBoardModelGroupList from "./DashBoardModelGroupList";
import styles from "./dashboard.module.css";
import { NavLink } from "react-router-dom";
import AuthComponent from "../auth/AuthComponent";
import DashboardCreatedUsersList from "./DashboardCreatedUsersList";

export enum UserRole {
	ADMIN = "ADMIN",
	DEVELOPER = "DEVELOPER",
	VIEWER = "VIEWER",
}
const Dashboard = () => {
	const { logout, getUser, removeModelGroup, fetchModelGroups } = useFEM();
	// const [user, setUser] = useState<User | null>(null);

	const user = getUser();

	useEffect(() => {
		fetchModelGroups();
	}, []);

	const handleRemoveModelGroup = (id: string) => {
		if (user) {
			removeModelGroup(id);
		}
	};

	const handleLogout = () => {
		logout();
	};

	return (
		<div style={{ height: "100%", minHeight: "1000px", overflow: "" }}>
			<Header>
				<div className={styles["header-content"]}>
					<h1>Dashboard</h1>
					<h3>Welcome {user?.username}</h3>
					<AuthComponent
						rolesAllowed={[UserRole.ADMIN, UserRole.DEVELOPER]}
					>
						<NavLink
							children={
								<button className={styles["upload-btn"]}>
									Upload
								</button>
							}
							to="/upload"
						/>
					</AuthComponent>
					<AuthComponent
						rolesAllowed={[UserRole.ADMIN, UserRole.DEVELOPER]}
					>
						<NavLink
							children={
								<button className={styles["upload-btn"]}>
									Create user
								</button>
							}
							to="/register"
						/>
					</AuthComponent>
					<button
						className={styles["logout-btn"]}
						onClick={handleLogout}
					>
						Logout
					</button>
				</div>
			</Header>

			{user?.modelGroups && (
				<DashBoardModelGroupList
					removeModelGroup={handleRemoveModelGroup}
					modelGroups={user.modelGroups}
				/>
			)}

			{user && (
				<AuthComponent
					rolesAllowed={[UserRole.ADMIN, UserRole.DEVELOPER]}
				>
					<DashboardCreatedUsersList user={user} />
				</AuthComponent>
			)}
		</div>
	);
};

export default Dashboard;
