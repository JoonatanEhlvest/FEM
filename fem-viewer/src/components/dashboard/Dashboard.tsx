import React, { useEffect, useState } from "react";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import DashBoardModelGroupList from "./DashBoardModelGroupList";
import styles from "./dashboard.module.css";
import { NavLink } from "react-router-dom";

export interface ModelGroup {
	modelGroup: {
		id: string;
		name: string;
		shares: {
			modelGroupId: string;
			sharedByName: string;
			sharedToName: string;
		}[];
	};
	owner: boolean;
}

interface User {
	username: string;
	modelGroups: ModelGroup[];
}

const Dashboard = () => {
	const { logout, fetchUser, setError } = useFEM();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		fetchUser()
			.then((res) => {
				setUser(res.data.user);
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	}, []);

	const removeModelGroup = (id: string) => {
		if (user) {
			setUser((prev) => {
				if (prev) {
					return {
						...prev,
						modelGroups: prev.modelGroups.filter(m => m.modelGroup.id !== id)
					};
				}
				return null;
			});
		}
	};

	const handleLogout = () => {
		logout();
	};

	return (
		<div style={{ height: "100%", minHeight: "1000px", overflow: "auto" }}>
			<Header>
				<div className={styles["header-content"]}>
					<h1>Dashboard</h1>
					<h3>Welcome {user?.username}</h3>
					<NavLink
						children={
							<button className={styles["upload-btn"]}>
								Upload
							</button>
						}
						to="/upload"
					/>
					<button
						className={styles["logout-btn"]}
						onClick={handleLogout}
					>
						Logout
					</button>
				</div>
			</Header>

			{user && <DashBoardModelGroupList removeModelGroup={removeModelGroup} modelGroups={user.modelGroups} />}
		</div>
	);
};

export default Dashboard;
