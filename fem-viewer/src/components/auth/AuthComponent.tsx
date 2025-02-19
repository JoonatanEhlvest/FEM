import { FC, JSX } from "react";
import useFEM from "../../state/useFEM";
import { UserRole } from "../dashboard/Dashboard";

type Props = {
	children: JSX.Element;
	rolesAllowed: UserRole[];
};

const AuthComponent: FC<Props> = ({ children, rolesAllowed }) => {
	const { getUser } = useFEM();
	const user = getUser();
	if (user && rolesAllowed.includes(user.role)) {
		return children;
	}

	return null;
};

export default AuthComponent;
