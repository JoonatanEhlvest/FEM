import React, { FC } from "react";
import FEMState from "../../state/FEMState";

type Props = {
	error: NonNullable<FEMState["error"]>;
};

const Error: FC<Props> = ({ error }) => {
	return (
		<div>
			<div>Status: {error.status}</div>
			<div>message: {error.message}</div>
		</div>
	);
};

export default Error;
