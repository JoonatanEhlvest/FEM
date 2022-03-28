import React, { FC } from "react";
import Draggable from "react-draggable";
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
			<Draggable>
				<div style={{ zIndex: 1000 }}>
					<Details />
				</div>
			</Draggable>
		</Popup>
	);
};

export default DetailsPopup;
