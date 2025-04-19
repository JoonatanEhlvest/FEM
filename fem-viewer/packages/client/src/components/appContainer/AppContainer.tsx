import React, { useEffect, useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import DynamicSVGView from "../dynamicsvg/DynamicSVGView";
import styles from "./appContainer.module.css";
import { Resizable, ResizeCallbackData } from "react-resizable";
import sharedStyles from "../../utlitity/sharedStyles.module.css";
import useFEM from "../../state/useFEM";
import Error from "../error/Error";
import DetailsPopup from "../viewer/DetailsPopup";

const AppContainer = () => {
	const { getError, getCurrentInstance } = useFEM();
	// For testing generating svg from XML data.
	// TODO: Remove once the final implementation is done.
	const [useDynamicSVG, setUseDynamicSVG] = useState(true);

	const [state, setState] = useState(() => {
		const appWidth = window.innerWidth;
		return {
			width: appWidth * 0.25,
		};
	});

	const onResize = (
		event: React.SyntheticEvent,
		data: ResizeCallbackData
	) => {
		setState((prevState) => {
			return {
				...prevState,
				width: data.size.width,
			};
		});
	};

	// For testing generating svg from XML data.
	// TODO: Remove once the final implementation is done.
	const toggleViewMode = () => {
		setUseDynamicSVG(!useDynamicSVG);
	};

	const error = getError();

	if (error) {
		return <Error error={error} />;
	}

	return (
		<div className={styles["app-container-container"]}>
			<Resizable
				height={0}
				width={state.width}
				handle={
					<div
						className={
							styles["model-tree-handle"] +
							" " +
							sharedStyles["handle"]
						}
					></div>
				}
				onResize={onResize}
			>
				<div
					className={styles["app-container-sidebar-container"]}
					style={{ flexBasis: state.width }}
				>
					<ModelTree />
				</div>
			</Resizable>

			{/* For testing generating svg from XML data.
				TODO: Remove once the final implementation is done. */}
			<div className={styles["view-container"]}>
				<div className={styles["view-toggle"]}>
					<button
						className={`${styles["toggle-button"]} ${
							useDynamicSVG ? styles["active"] : ""
						}`}
						onClick={toggleViewMode}
						disabled={useDynamicSVG}
					>
						Dynamic SVG View
					</button>
					<button
						className={`${styles["toggle-button"]} ${
							!useDynamicSVG ? styles["active"] : ""
						}`}
						onClick={toggleViewMode}
						disabled={!useDynamicSVG}
					>
						Legacy View
					</button>
				</div>

				{useDynamicSVG ? <DynamicSVGView /> : <Viewer />}
			</div>

			{getCurrentInstance() !== undefined && <DetailsPopup />}
		</div>
	);
};

export default AppContainer;
