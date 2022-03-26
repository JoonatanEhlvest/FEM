import axios from "axios";
import { exec } from "child_process";
import { XMLParser } from "fast-xml-parser";
import React, { ChangeEvent, FC, useEffect, useState } from "react";
import createParser from "../../parser";
import useFEM from "../../state/useFEM";
import { ATTR_PREFIX } from "../../utlitity";

const FileUpload = () => {
	const { addModel, addSvg } = useFEM();
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [xmlFiles, setXMLFiles] = useState<Array<File | null> | null>(null);
	const [svgFiles, setsvgFiles] = useState<Array<File | null> | null>(null);
	const [modelGroupUploadName, setModelGroupUploadName] = useState("");

	const fetchModelGroupLinks = () => {
		axios
			.get("/api/v1/upload")
			.then((res) => {
				setUploadError(null);
			})
			.catch((_) => {
				setUploadError("Couln't find modelGroups");
			});
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const data = new FormData();
		data.append("modelGroupName", modelGroupUploadName);
		if (xmlFiles) {
			xmlFiles.forEach((file) => {
				if (file) {
					data.append("files", file);
				}
			});
		}

		if (svgFiles) {
			svgFiles.forEach((file) => {
				if (file) {
					data.append("files", file);
				}
			});
		}

		axios
			.post("/api/v1/upload", data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.catch((err) => console.log(err));
	};

	const onXMLChange = (e: ChangeEvent<HTMLInputElement>) => {
		setUploadError(null);
		if (e.target.files === null) {
			setUploadError("Couldnt upload file");
			return;
		}
		const file = e.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (event) => {
			const contents = event?.target?.result;

			try {
				const parser = createParser(contents);
				parser.getModels().forEach((model: any) => {
					addModel(model);
				});
				setXMLFiles([file]);
			} catch {
				setUploadError(`Couldn't parse ${file.name}`);
			}
		};

		fileReader.readAsText(file);
	};

	const onSVGSChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files === null) {
			return;
		}

		const options = {
			ignoreAttributes: false,
			attributeNamePrefix: ATTR_PREFIX,
		};
		const parser = new XMLParser(options);

		const svgs: Array<File | null> = [];
		Array.from(e.target.files).forEach((file: File) => {
			try {
				readSvg(parser, file);
				svgs.push(file);
			} catch {
				setUploadError(`Couldn't parse ${file.name}`);
			}
		});

		setsvgFiles(svgs);
	};

	const readSvg = (parser: XMLParser, file: File) => {
		const fileReader = new FileReader();
		fileReader.onload = (event) => {
			const contents = event?.target?.result;
			const xml = contents as string;
			const jObj = parser.parse(xml);
			addSvg(file.name.replace(/.svg/g, "").trimEnd(), jObj);
		};

		fileReader.readAsText(file);
	};

	return (
		<div>
			<form onSubmit={onSubmit}>
				<label>Model Group Name</label>
				<input
					onChange={(e) => setModelGroupUploadName(e.target.value)}
					type="text"
					name=""
					id=""
					value={modelGroupUploadName}
				/>
				<label>Input the XML export</label>
				<input onChange={onXMLChange} type="file" accept=".xml" />
				<label>Input the SVGs</label>
				<input
					onChange={onSVGSChange}
					type="file"
					multiple
					accept=".svg"
				/>
				<input type="submit" />
			</form>
			{uploadError && <div>{uploadError}</div>}
		</div>
	);
};

export default FileUpload;
