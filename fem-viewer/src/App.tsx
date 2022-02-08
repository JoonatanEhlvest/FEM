import "./App.css";
import XMLData from "./assets/BMI.xml";
import { XMLParser } from "fast-xml-parser";
import { useEffect } from "react";
import axios from "axios";
import FEMContext from "./state/FEMContext";
import ModelTree from "./components/ModelTree";
import Viewer from "./components/Viewer";
import FEMProvider from "./state/FEMProvider";

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

function App() {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
	};
	const parser = new XMLParser(options);

	useEffect(() => {
		axios.get(XMLData).then((res) => {
			const xml: string = res.data;
			const jObj = parser.parse(xml);
			console.log(jObj);
		});
	});

	return (
		<div className="App">
			<FEMProvider>
				<ModelTree />
				<Viewer />
			</FEMProvider>
		</div>
	);
}

export default App;
