import React, { useEffect, useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import styles from "./appContainer.module.css";
import Details from "../details/Details";
import { Resizable, ResizeCallbackData } from "react-resizable";
import sharedStyles from "../../utlitity/sharedStyles.module.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Parser } from "../../parser";
import useFEM from "../../state/useFEM";

const AppContainer = () => {
	const { id } = useParams();
	const { addModel } = useFEM();

	const [state, setState] = useState(() => {
		const appWidth = window.innerWidth;
		return {
			width: appWidth * 0.25,
		};
	});

	useEffect(() => {
		axios.get(`/api/v1/modelgroups/${id}`).then((res) => {
			console.log(res.data);
			const parser = new Parser(res.data.xml);
			parser
				.getModels()
				.forEach((model: any) => {
					addModel(model);
				})
				.catch((err: any) => console.log(err));
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
					<Details />
				</div>
			</Resizable>
			<Viewer />
		</div>
	);
};

export default AppContainer;
