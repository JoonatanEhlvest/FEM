import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import React, { useEffect, useState } from "react";
import ModelTree from "../modelTree/ModelTree";
import Viewer from "../viewer/Viewer";
import XMLData from "../../assets/BMI.xml";
import useFEM from "../../state/useFEM";
import styles from "./appContainer.module.css";
import Details from "../details/Details";
import { Resizable, ResizeCallbackData } from "react-resizable";

const getModelAttrs = (jObj: any) => {
	const names: { [key: string]: number } = {};
	jObj.ADOXML.MODELS.MODEL.forEach((element: any) => {
		const attrs = element.MODELATTRIBUTES.ATTRIBUTE;
		attrs.forEach((attr: any) => {
			const name = attr["@_name"];
			if (names[name]) {
				names[name] += 1;
			} else {
				names[name] = 1;
			}
		});
	});

	console.log(names);
};

const AppContainer = () => {
	const { addModel } = useFEM();

	const [state, setState] = useState(() => {
		const appWidth = window.innerWidth;
		return {
			width: appWidth * 0.25,
		};
	});

	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
	};
	const parser = new XMLParser(options);

	useEffect(() => {
		axios.get(XMLData).then((res) => {
			const xml: string = res.data;
			const jObj = parser.parse(xml);

			const models: Array<any> = jObj.ADOXML.MODELS.MODEL;

			models.forEach((model) => {
				addModel(model);
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
