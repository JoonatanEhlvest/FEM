import React, { FC } from "react";
import SharedInstanceProps from "../../shared/SharedInstanceProps";
import styles from "./asset.module.css";

interface Props extends SharedInstanceProps {}

const Asset: FC<Props> = ({ instance, sharedStyles }) => {
	return (
		<div className={styles["asset-container"]} style={sharedStyles}>
			<div>{instance.class}</div>
			<div>{instance.denomination}</div>
		</div>
	);
};

export default Asset;
