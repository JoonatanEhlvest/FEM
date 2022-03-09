import React, { useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import styles from "./appContainer.module.css";
import Details from "../details/Details";
import { Resizable, ResizeCallbackData } from "react-resizable";
import FileUpload from "../fileUpload/FileUpload";

const AppContainer = () => {
	const [filesUploaded, setFilesUploaded] = useState(false);

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

	return (
		<div className={styles["app-container-container"]}>
			{filesUploaded ? (
				<Resizable
					height={0}
					width={state.width}
					handle={<div className={styles["model-tree-handle"]}></div>}
					onResize={onResize}
				>
					<div
						className={styles["app-container-sidebar-container"]}
						style={{ flexBasis: state.width }}
					>
						<ModelTree />
						<Details />
					</div>
				</Resizable>
			) : (
				<FileUpload toggleViewer={setFilesUploaded} />
			)}

			<Viewer />
		</div>
	);
};

export default AppContainer;
