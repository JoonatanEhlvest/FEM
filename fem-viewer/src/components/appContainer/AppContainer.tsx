import React, { useEffect, useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import XMLData from "../../assets/BMI.xml";
import useFEM from "../../state/useFEM";
import styles from "./appContainer.module.css";
import Details from "../details/Details";
import { Resizable, ResizeCallbackData } from "react-resizable";
import Parser from "../../parser";
import createParser from "../../parser";

const AppContainer = () => {
	const { addModel } = useFEM();

	const [state, setState] = useState(() => {
		const appWidth = window.innerWidth;
		return {
			width: appWidth * 0.25,
		};
	});

	useEffect(() => {
		createParser(XMLData)
			.then((parser) => {
				if (parser == null) {
					console.error("Couldn't create parser");
					return;
				}
				console.log(parser._parsedXML);

				parser.getModels().forEach((model: any) => {
					addModel(model);
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

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

			<Viewer />
		</div>
	);
};

export default AppContainer;
