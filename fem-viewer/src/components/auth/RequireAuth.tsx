import React, { FC } from "react";
import { Navigate } from "react-router-dom";
import useFEM from "../../state/useFEM";

type Props = {
	children: JSX.Element;
};

const RequireAuth: FC<Props> = ({ children }) => {
	const { isAuthenticated } = useFEM();

	if (isAuthenticated()) {
		return children;
	}

	return <Navigate to="/login" />;
};

export default RequireAuth;
