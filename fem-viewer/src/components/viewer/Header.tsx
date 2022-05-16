import React, { ChangeEvent, FC } from "react";
import Model from "../../state/types/Model";
import useFEM from "../../state/useFEM";
import styles from "./header.module.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { NavLink } from "react-router-dom";

type Props = {
	model: Model | undefined;
};

const Header: FC<Props> = ({ model }) => {
	const { setZoom, getZoom } = useFEM();

	const onChangeZoom = (value: number | number[]) => {
		if (typeof value === "number") {
			setZoom(value);
		}
	};

	return (
		<div className={styles["header-container"]}>
			{model && (
				<div className={styles["header-content"]}>
					<div>
						{model.name} ({model.modeltype})
					</div>
					<div style={{ width: "100px" }}> </div>

					<div className={styles["slider"]}>
						<Slider
							min={0.5}
							max={2}
							step={0.01}
							value={getZoom()}
							onChange={onChangeZoom}
						/>
					</div>
				</div>
			)}
			<NavLink to="/dashboard">
				<button className={styles["dashboard-btn"]}>Dashboard</button>
			</NavLink>
		</div>
	);
};

export default Header;
