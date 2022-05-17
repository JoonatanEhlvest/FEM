import React, { FC } from "react";
import Draggable from "react-draggable";
import Popup from "reactjs-popup";
import useFEM from "../../state/useFEM";
import Details from "../details/Details";

type Props = {};

// const DetailsPopup: FC<Props> = () => {
// 	const {
// 		getCurrentInstance,
// 		setCurrentInstance,
// 		clearAllOccurrencesHighlighting,
// 		setReferenceBackNavigation,
// 	} = useFEM();

// 	return (
// 		<Popup
// 			open={getCurrentInstance() !== undefined}
// 			closeOnDocumentClick={false}
// 			lockScroll={false}
// 			onClose={() => {
// 				setCurrentInstance(undefined);
// 				clearAllOccurrencesHighlighting();
// 				setReferenceBackNavigation(null);
// 			}}
// 		>
// 			<Draggable>
// 				<div>
// 					<Details />
// 				</div>
// 			</Draggable>
// 		</Popup>
// 	);
// };

const DetailsPopup = () => {
	return (
		<Draggable>
			<div
				style={{
					position: "absolute",
					left: "50%",
					top: "50%",
					zIndex: 1000,
				}}
			>
				<Details />
			</div>
		</Draggable>
	);
};

export default DetailsPopup;
