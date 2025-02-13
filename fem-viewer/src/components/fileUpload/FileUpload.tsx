import http from "../../http";
import { XMLParser } from "fast-xml-parser";
import React, { ChangeEvent, useState } from "react";
import useFEM from "../../state/useFEM";
import { ATTR_PREFIX } from "../../utlitity";
import createParser from "../../parser";
import Header from "../header/Header";
import { NavLink } from "react-router-dom";
import styles from "./fileUpload.module.css";

const FileUpload = () => {
	const { setError, setPopup } = useFEM();
	const [uploadError, setUploadError] = useState(false);
	const [xmlFiles, setXMLFiles] = useState<Array<File | null> | null>(null);
	const [svgFiles, setsvgFiles] = useState<Array<File | null> | null>(null);
	const [modelGroupUploadName, setModelGroupUploadName] = useState("");

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

		http.post("/api/v1/upload", data, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
			.then((res) => {
				setPopup({ message: "Successfully uploaded" });

				setModelGroupUploadName("");
			})
			.catch((err) => {
				setError({
					status: err.response.status,
					message: err.response.data.message,
				});
			});
	};

	const onXMLChange = (e: ChangeEvent<HTMLInputElement>) => {
		setUploadError(false);
		if (e.target.files === null) {
			setUploadError(true);
			return;
		}
		const file = e.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (event) => {
			try {
				const data = event.target?.result;
				createParser(data).getModels();
			} catch (err) {
				setUploadError(true);
				setError({
					status: 422,
					message: "Couldn't parse file: " + file.name,
				});
			}
			setXMLFiles([file]);
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
				svgs.push(file);
			} catch {
				setUploadError(true);
				setError({
					status: 422,
					message: "Couldn't parse svg " + file.name,
				});
			}
		});

		setsvgFiles(svgs);
	};

	return (
		<div>
			<Header>
				<div className={styles["header-content"]}>
					<h1>Upload</h1>
					<NavLink to="/dashboard">
						<button className={styles["dashboard-btn"]}>
							Dashboard
						</button>
					</NavLink>
				</div>
			</Header>
			<form onSubmit={onSubmit}>
				<div className={styles["form-data"]}>
					<label>Model Group Name</label>
					<input
						onChange={(e) =>
							setModelGroupUploadName(e.target.value)
						}
						type="text"
						name=""
						id=""
						value={modelGroupUploadName}
					/>
				</div>
				<div className={styles["form-data"]}>
					<label>Input the XML export</label>
					<input onChange={onXMLChange} type="file" accept=".xml" />
				</div>
				<div className={styles["form-data"]}>
					<label>Input the SVGs</label>
					<input
						onChange={onSVGSChange}
						type="file"
						multiple
						accept=".svg"
					/>
				</div>
				<input type="submit" value={"Upload"} />
			</form>
		</div>
	);
};

export default FileUpload;
