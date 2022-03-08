import React, { useEffect, useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import useFEM from "../../state/useFEM";
import styles from "./appContainer.module.css";
import Details from "../details/Details";
import { Resizable, ResizeCallbackData } from "react-resizable";
import createParser from "../../parser";
import FileUpload from "../fileUpload/FileUpload";

const AppContainer = () => {
	const { addModel } = useFEM();
	const [filesUploaded, setFilesUploaded] = useState(false);

	const [state, setState] = useState(() => {
		const appWidth = window.innerWidth;
		return {
			width: appWidth * 0.25,
		};
	});

	// useEffect(() => {
	// 	createParser(XMLData)
	// 		.then((parser) => {
	// 			if (parser == null) {
	// 				console.error("Couldn't create parser");
	// 				return;
	// 			}
	// 			console.log(parser._parsedXML);

	// 			parser.getModels().forEach((model: any) => {
	// 				addModel(model);
	// 			});
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);
	// 		});
	// }, []);

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
