import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import React, { useEffect } from "react";
import ModelTree from "./ModelTree";
import Viewer from "./Viewer";
import XMLData from "../assets/BMI.xml";
import useFEM from "../state/useFEM";

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

	return (
		<div>
			<ModelTree />
			<Viewer />
		</div>
	);
};

export default AppContainer;
