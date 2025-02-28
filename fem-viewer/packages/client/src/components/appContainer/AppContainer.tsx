import React, { useEffect, useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import styles from "./appContainer.module.css";
import { Resizable, ResizeCallbackData } from "react-resizable";
import sharedStyles from "../../utlitity/sharedStyles.module.css";
import useFEM from "../../state/useFEM";
import Error from "../error/Error";
import DetailsPopup from "../viewer/DetailsPopup";

const AppContainer = () => {
	const { getError, getCurrentInstance } = useFEM();

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
			<Viewer />
			{getCurrentInstance() !== undefined && <DetailsPopup />}
		</div>
	);
};

export default AppContainer;
