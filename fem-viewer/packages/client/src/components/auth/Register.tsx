import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";
import { UserRole } from "../dashboard/Dashboard";
import Header from "../header/Header";
import styles from "./auth.module.css";

const Register = () => {
	const { register, setError, getUser, setPopup } = useFEM();

	const { state, handleChange, clearState } = useForm({
		username: "",
		password: "",
		confirmPassword: "",
		role: UserRole.VIEWER,
	});

	const user = getUser();

	const handleRegister = () => {
		if (state.password !== state.confirmPassword) {
			setError({ status: 422, message: "Passwords do not match" });
			return;
		}
		register(state.username, state.password, state.role).then((_) => {
			clearState();
		});
	};

	return (
		<div>
			<Header>
				<div className={styles["header-content"]}>
					<h2>FEM viewer</h2>
					<NavLink to="/dashboard">
						<button className={styles["dashboard-btn"]}>
							Dashboard
						</button>
					</NavLink>
				</div>
			</Header>
			<h1>Create User</h1>
			<form onSubmit={(e) => e.preventDefault()}>
				<div className={styles["form-data"]}>
					<label>Username</label>
					<input
						name="username"
						onChange={handleChange}
						type="text"
						value={state.username}
					/>
				</div>
				<div className={styles["form-data"]}>
					<label>Password</label>
					<input
						name="password"
						onChange={handleChange}
						type="password"
						value={state.password}
					/>
				</div>
				<div className={styles["form-data"]}>
					<label>Confirm Password</label>
					<input
						name="confirmPassword"
						onChange={handleChange}
						type="password"
						value={state.confirmPassword}
					/>
				</div>
				<h3>Role</h3>
				<div className={styles["form-data"]} onChange={handleChange}>
					{user?.role === UserRole.ADMIN && (
						<div className={styles["form-checkbox"]}>
							<label>Admin</label>
							<input
								type="radio"
								name="role"
								value={UserRole.ADMIN}
							/>
						</div>
					)}
					{user?.role === UserRole.ADMIN && (
						<div className={styles["form-checkbox"]}>
							<label>Developer</label>
							<input
								type="radio"
								name="role"
								value={UserRole.DEVELOPER}
							/>
						</div>
					)}
					{user?.role === UserRole.ADMIN && (
						<div className={styles["form-checkbox"]}>
							<label>Expert</label>
							<input
								type="radio"
								name="role"
								value={UserRole.EXPERT}
							/>
						</div>
					)}
					<div className={styles["form-checkbox"]}>
						<label>Viewer</label>
						<input
							defaultChecked
							type="radio"
							name="role"
							value={UserRole.VIEWER}
						/>
					</div>
				</div>
				<button onClick={handleRegister}>Create</button>
			</form>
		</div>
	);
};

export default Register;
