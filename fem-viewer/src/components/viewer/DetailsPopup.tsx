import React, { FC } from "react";
import Draggable from "react-draggable";
import Popup from "reactjs-popup";
import useFEM from "../../state/useFEM";
import Details from "../details/Details";

type Props = {};

const DetailsPopup: FC<Props> = () => {
	const {
		getCurrentInstance,
		setCurrentInstance,
		clearAllOccurrencesHighlighting,
	} = useFEM();

	return (
		<Popup
			open={getCurrentInstance() !== undefined}
			closeOnDocumentClick
			closeOnEscape
			lockScroll={false}
			onClose={() => {
				setCurrentInstance(undefined);
				clearAllOccurrencesHighlighting();
			}}
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
