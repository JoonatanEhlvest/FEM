import React, { FC } from "react";
import { Navigate } from "react-router-dom";
import useFEM from "../../state/useFEM";
import Header from "../header/Header";

type Props = {
	children: JSX.Element;
};

const RequireAuth: FC<Props> = ({ children }) => {
	const { isAuthenticated } = useFEM();

	if (!isAuthenticated()) {
		return (
			<div>
				<Header>
					<h2>FEM viewer</h2>
				</Header>
				{children}
			</div>
		);
	}

	return <Navigate to="/dashboard" />;
};

export default RequireAuth;
