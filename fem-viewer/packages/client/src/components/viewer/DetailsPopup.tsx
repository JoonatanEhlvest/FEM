import React, { useRef, RefObject } from "react";
import Draggable from "react-draggable";
import Details from "../details/Details";
import styles from "./detailsPopup.module.css";

const DetailsPopup = () => {
	const dragRef = useRef<HTMLDivElement>(null);

	return (
		<Draggable 
			nodeRef={dragRef as RefObject<HTMLElement>}
			handle=".draggable-handle"
		>
			<div
				ref={dragRef}
				className={styles.detailsPopupContainer}
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
