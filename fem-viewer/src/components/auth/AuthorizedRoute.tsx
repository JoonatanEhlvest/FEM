import React, { FC } from "react";
import { Navigate } from "react-router-dom";
import { User } from "../../state/FEMState";
import { UserRole } from "../dashboard/Dashboard";
import RequireAuth from "./RequireAuth";

type Props = {
	rolesAllowed: UserRole[];
	user: User | null;
	children: JSX.Element;
};

const AuthorizedRoute: FC<Props> = ({ rolesAllowed, user, children }) => {
	if (!user || !rolesAllowed.includes(user.role)) {
		return <Navigate to="/" />;
	}
	return <RequireAuth>{children}</RequireAuth>;
};

export default AuthorizedRoute;
