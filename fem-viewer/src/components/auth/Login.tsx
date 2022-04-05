import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";
import styles from "./auth.module.css";

const Login = () => {
	const { login } = useFEM();

	const { state, handleChange } = useForm({ username: "", password: "" });

	const handleLogin = () => {
		login(state.username, state.password);
	};

	return (
		<div>
			<h1>Login</h1>
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

				<button onClick={handleLogin}>Login</button>
			</form>
			<div className={styles["register-link-container"]}>
				<p>New user?</p>
				<NavLink to="/register">
					<strong>Sign up here</strong>
				</NavLink>
			</div>
		</div>
	);
};

export default Login;
