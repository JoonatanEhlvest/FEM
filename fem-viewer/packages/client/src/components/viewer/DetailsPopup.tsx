import React, { useRef, RefObject } from "react";
import Draggable from "react-draggable";
import Details from "../details/Details";

const DetailsPopup = () => {
	const dragRef = useRef<HTMLDivElement>(null);

	return (
		// Provide ref to child element to work around the findDOMNode being deprecated in React 19
		// https://github.com/react-grid-layout/react-draggable/issues/771
		<Draggable nodeRef={dragRef as RefObject<HTMLElement>}>
			<div
				ref={dragRef}
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
