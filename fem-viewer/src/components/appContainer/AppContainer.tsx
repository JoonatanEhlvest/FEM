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
import Error from "../error/Error";

const AppContainer = () => {
	const { id } = useParams();
	const { addModel, addSvg, getError, setError } = useFEM();

	const [state, setState] = useState(() => {
		const appWidth = window.innerWidth;
		return {
			width: appWidth * 0.25,
		};
	});

	useEffect(() => {
		axios
			.get(`/api/v1/modelgroups/${id}`)
			.then((res) => {
				console.log(res.data);
				const svgs = res.data.svgs;
				svgs.forEach((svg: any) => {
					addSvg(svg.name, svg.data);
				});
				const parser = new Parser(res.data.xml);
				parser.getModels().forEach((model: any) => {
					addModel(model);
				});
			})
			.catch((err: any) => {
				console.log(err.response);
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
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
					<Details />
				</div>
			</Resizable>
			<Viewer />
		</div>
	);
};

export default AppContainer;
