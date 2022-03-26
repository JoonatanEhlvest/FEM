import React, { useState } from "react";
import { useForm } from "../../hooks/useForm";
import useFEM from "../../state/useFEM";

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
				<button onClick={handleLogin}>Login</button>
			</form>
		</div>
	);
};

export default Login;
