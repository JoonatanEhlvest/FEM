import React from "react";
import Draggable from "react-draggable";
import Details from "../details/Details";

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
