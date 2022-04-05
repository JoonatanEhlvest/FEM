import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";
import styles from "./auth.module.css";

const Register = () => {
	const { register } = useFEM();

	const { state, handleChange } = useForm({ username: "", password: "" });

	const handleRegister = () => {
		register(state.username, state.password);
	};

	return (
		<div>
			<h1>Register</h1>
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
				<button onClick={handleRegister}>Register</button>
			</form>
			<div className={styles["register-link-container"]}>
				<p>Already have an account?</p>
				<NavLink to="/login">
					<strong>Log in here</strong>
				</NavLink>
			</div>
		</div>
	);
};

export default Register;
