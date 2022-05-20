import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import useFEM from "../../state/useFEM";
import AppContainer from "../appContainer/AppContainer";
import ApplicationError from "../applicationError/ApplicationError";
import AuthorizedRoute from "../auth/AuthorizedRoute";
import AuthRoute from "../auth/AuthRoute";
import Login from "../auth/Login";
import Register from "../auth/Register";
import RequireAuth from "../auth/RequireAuth";
import Dashboard, { UserRole } from "../dashboard/Dashboard";
import FileUpload from "../fileUpload/FileUpload";
import Popup from "../popUp/Popup";

const AppRouter = () => {
	const { getError, setError, getPopup, setPopup, getUser } = useFEM();
	const error = getError();
	const popup = getPopup();
	const user = getUser();
	return (
		<BrowserRouter>
			{error && (
				<ApplicationError
					error={error}
					handleClose={() => setError(null)}
				/>
			)}

			{popup && (
				<Popup popUp={popup} handleClose={() => setPopup(null)} />
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
						<AuthorizedRoute
							user={user}
							rolesAllowed={[UserRole.DEVELOPER, UserRole.ADMIN]}
						>
							<Register />
						</AuthorizedRoute>
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
						<AuthorizedRoute
							user={user}
							rolesAllowed={[UserRole.DEVELOPER, UserRole.ADMIN]}
						>
							<FileUpload />
						</AuthorizedRoute>
					}
				/>
				<Route
					path="*"
					element={
						<RequireAuth>
							<Dashboard />
						</RequireAuth>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
};

export default AppRouter;
