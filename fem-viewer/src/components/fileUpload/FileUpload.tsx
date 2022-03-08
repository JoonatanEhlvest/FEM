import { XMLParser } from "fast-xml-parser";
import React, { ChangeEvent, FC, useState } from "react";
import createParser from "../../parser";
import useFEM from "../../state/useFEM";
import { ATTR_PREFIX } from "../../utlitity";

type Props = {
	toggleViewer: React.Dispatch<React.SetStateAction<boolean>>;
};

const FileUpload: FC<Props> = ({ toggleViewer }) => {
	const { addModel, addSvg, test } = useFEM();
	const [uploadError, setUploadError] = useState<string | null>(null);
	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		toggleViewer(true);
		test();
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

		Array.from(e.target.files).forEach((file: File) => {
			readSvg(parser, file);
		});
	};

	const readSvg = (parser: XMLParser, file: File) => {
		const fileReader = new FileReader();
		fileReader.onload = (event) => {
			const contents = event?.target?.result;
			const xml = contents as string;
			const jObj = parser.parse(xml);
			addSvg(file.name.replace(/.svg/g, ""), jObj);
		};

		fileReader.readAsText(file);
	};

	return (
		<div>
			<form onSubmit={onSubmit}>
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
