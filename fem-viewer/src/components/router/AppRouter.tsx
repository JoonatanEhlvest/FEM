import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import useFEM from "../../state/useFEM";
import AppContainer from "../appContainer/AppContainer";
import ApplicationError from "../applicationError/ApplicationError";
import AuthRoute from "../auth/AuthRoute";
import Login from "../auth/Login";
import Register from "../auth/Register";
import RequireAuth from "../auth/RequireAuth";
import Dashboard from "../dashboard/Dashboard";
import FileUpload from "../fileUpload/FileUpload";

const AppRouter = () => {
	const { getError, setError } = useFEM();
	const error = getError();
	return (
		<BrowserRouter>
			{error && (
				<ApplicationError
					error={error}
					handleClose={() => setError(null)}
				/>
			)}
			<Routes>
				<Route
					path="/dashboard"
					element={
						<RequireAuth>
							<Dashboard />
						</RequireAuth>
					}
				/>
				<Route
					path="/login"
					element={
						<AuthRoute>
							<Login />
						</AuthRoute>
					}
				/>
				<Route
					path="/register"
					element={
						<AuthRoute>
							<Register />
						</AuthRoute>
					}
				/>
				<Route
					path="/viewer"
					element={
						<RequireAuth>
							<AppContainer />
						</RequireAuth>
					}
				/>
				<Route
					path="/upload"
					element={
						<RequireAuth>
							<FileUpload />
						</RequireAuth>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
};

export default AppRouter;
