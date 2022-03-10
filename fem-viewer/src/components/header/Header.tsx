import React, { FC } from "react";
import styles from "./header.module.css";

type Props = {
	children: JSX.Element;
};

const Header: FC<Props> = ({ children }) => {
	return <div className={styles["header-container"]}>{children}</div>;
};

export default Header;
