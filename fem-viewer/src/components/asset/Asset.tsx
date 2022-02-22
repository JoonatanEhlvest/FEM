import React, { FC } from "react";
import Instance from "../../state/types/Instance";
import styles from "./asset.module.css";

type Props = {
	instance: Instance;
};

const Asset: FC<Props> = ({ instance }) => {
	return (
		<div className={styles["asset-container"]}>
			<div>{instance.class}</div>
			<div>{instance.denomination}</div>
		</div>
	);
};

export default Asset;
