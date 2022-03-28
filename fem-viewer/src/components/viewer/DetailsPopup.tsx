import React, { FC } from "react";
import Popup from "reactjs-popup";
import useFEM from "../../state/useFEM";
import Details from "../details/Details";

type Props = {};

const DetailsPopup: FC<Props> = () => {
	const { getCurrentInstance, setCurrentInstance } = useFEM();

	return (
		<Popup
			open={getCurrentInstance() !== undefined}
			closeOnDocumentClick
			closeOnEscape
			onClose={() => setCurrentInstance(undefined)}
		>
			<Details />
		</Popup>
	);
};

export default DetailsPopup;
