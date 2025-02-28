import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import http from "../../http";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";
import styles from "./auth.module.css";

const ChangePassword = () => {
	const { setError, setPopup, logout } = useFEM();

	const navigate = useNavigate();

	const { state, handleChange, clearState } = useForm({
		password: "",
		confirmPassword: "",
	});

	const handleRegister = () => {
		if (state.password !== state.confirmPassword) {
			setError({
				status: 422,
				message: "Passwords don't match",
			});
			clearState();
			return;
		}

		http.patch("/api/v1/user/changePassword", { password: state.password })
			.then((res) => {
				setPopup({ message: res.data.message });
				logout();
			})
			.catch((err) => console.log(err));

		clearState();
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
			<h1>Change password</h1>
			<form onSubmit={(e) => e.preventDefault()}>
				<div className={styles["form-data"]}>
					<label>New password</label>
					<input
						name="password"
						onChange={handleChange}
						type="password"
						value={state.password}
					/>
				</div>
				<div className={styles["form-data"]}>
					<label>Confirm new password</label>
					<input
						name="confirmPassword"
						onChange={handleChange}
						type="password"
						value={state.confirmPassword}
					/>
				</div>

				<button onClick={handleRegister}>Create</button>
			</form>
		</div>
	);
};

export default ChangePassword;
