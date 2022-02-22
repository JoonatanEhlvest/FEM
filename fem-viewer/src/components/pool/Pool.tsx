import React, { FC } from "react";
import Instance from "../../state/types/Instance";
import styles from "./pool.module.css";

type Props = {
	instance: Instance;
};

const Pool: FC<Props> = ({instance}) => {
	return <div className={styles["pool-container"]}>
		<div>{instance.class}</div>
		<div>{instance.denomination}</div>
	</div>;
};

export default Pool;
