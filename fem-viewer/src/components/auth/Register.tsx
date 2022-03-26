import React, { useState } from "react";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";

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
				<label>Username</label>
				<input
					name="username"
					onChange={handleChange}
					type="text"
					value={state.username}
				/>
				<label>Password</label>
				<input
					name="password"
					onChange={handleChange}
					type="password"
					value={state.password}
				/>
				<button onClick={handleRegister}>Register</button>
			</form>
		</div>
	);
};

export default Register;
