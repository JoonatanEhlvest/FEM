import React, { CSSProperties, FC, JSX } from "react";
import styles from "./header.module.css";

type Props = {
	children: JSX.Element;
	extraStyles?: CSSProperties;
};

const Header: FC<Props> = ({ children, extraStyles }) => {
	return (
		<div className={styles["header-container"]} style={extraStyles}>
			{children}
		</div>
	);
};

export default Header;
