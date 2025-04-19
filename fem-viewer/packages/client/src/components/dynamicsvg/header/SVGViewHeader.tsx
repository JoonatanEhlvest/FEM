import React, { FC } from "react";
import { Model } from "@fem-viewer/types";
import styles from "./svgViewHeader.module.css";
import { NavLink } from "react-router-dom";

type Props = {
	model: Model | undefined;
	zoom: number;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onResetZoom: () => void;
};

const SVGViewHeader: FC<Props> = ({
	model,
	zoom,
	onZoomIn,
	onZoomOut,
	onResetZoom,
}) => {
	return (
		<div className={styles["header-container"]}>
			<div className={styles["header-content"]}>
				{model ? (
					<>
						<div className={styles["model-info"]}>
							{model.name} ({model.modeltype})
						</div>
						<div className={styles["spacer"]} />
						<div className={styles["zoom-controls"]}>
							<button
								className={styles["zoom-button"]}
								onClick={onZoomOut}
							>
								-
							</button>
							<button
								className={styles["zoom-button"]}
								onClick={onResetZoom}
							>
								Reset
							</button>
							<button
								className={styles["zoom-button"]}
								onClick={onZoomIn}
							>
								+
							</button>
							<div className={styles["zoom-level"]}>
								{Math.round(zoom * 100)}%
							</div>
						</div>
					</>
				) : (
					<div className={styles["model-info"]}>
						No model selected
					</div>
				)}
			</div>
			<NavLink to="/dashboard">
				<button className={styles["dashboard-btn"]}>Dashboard</button>
			</NavLink>
		</div>
	);
};

export default SVGViewHeader;
