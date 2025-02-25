import { FC, JSX } from "react";
import styles from "./cell.module.css";

type Props = {
	title: string;
	value: string | JSX.Element;
};

const Cell: FC<Props> = ({ title, value }) => {
	return (
		<div
			className={
				typeof value === "string"
					? styles["cell-row"]
					: styles["cell-row-child"]
			}
		>
			<div
				className={
					typeof value === "string"
						? styles["prop-title"]
						: styles["prop-title-child"]
				}
			>
				{title}
			</div>
			<div
				className={
					typeof value === "string"
						? styles["prop-value"]
						: styles["prop-value-child"]
				}
			>
				{value}
			</div>
		</div>
	);
};

export default Cell;
