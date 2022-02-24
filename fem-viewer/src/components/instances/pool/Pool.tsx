import React, { FC } from "react";
import Instance from "../../../state/types/Instance";
import SharedInstanceProps from "../../shared/SharedInstanceProps";
import styles from "./pool.module.css";

interface Props extends SharedInstanceProps {}

const Pool: FC<Props> = ({ instance, sharedStyles }) => {
	return (
		<div className={styles["pool-container"]} style={sharedStyles}>
			<div>{instance.class}</div>
			<div>{instance.denomination}</div>
		</div>
	);
};

export default Pool;
