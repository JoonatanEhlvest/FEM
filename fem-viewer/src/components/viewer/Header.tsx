import React, { FC } from "react";
import Model from "../../state/types/Model";
import styles from "./header.module.css";

type Props = {
	model: Model | undefined;
};

const Header: FC<Props> = ({ model }) => {
	return (
		<div className={styles["header-container"]}>
			{model && (
				<div className={styles["header-content"]}>
					<div>{model.name}</div>
					<div style={{ width: "100px" }}> </div>
					<div>{model.id}</div>
				</div>
			)}
		</div>
	);
};

export default Header;
