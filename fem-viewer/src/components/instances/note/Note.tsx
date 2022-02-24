import React, { FC } from "react";
import SharedInstanceProps from "../../shared/SharedInstanceProps";
import styles from "./note.module.css";

interface Props extends SharedInstanceProps {}

const Note: FC<Props> = ({ instance, sharedStyles }) => {
	return (
		<div className={styles["note-container"]} style={sharedStyles}>
			<div>{instance.description}</div>
		</div>
	);
};

export default Note;
