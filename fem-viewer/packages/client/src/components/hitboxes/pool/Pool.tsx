import React, { FC } from "react";
import SharedInstanceProps from "../../shared/SharedInstanceProps";
import styles from "./pool.module.css";

interface Props extends SharedInstanceProps {}

const Pool: FC<Props> = ({ instance, sharedStyles }) => {
	return (
		<div className={styles["pool-container"]} style={sharedStyles}></div>
	);
};

export default Pool;
