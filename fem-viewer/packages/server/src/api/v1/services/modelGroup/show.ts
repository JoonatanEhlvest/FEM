import { Model } from "@fem-viewer/types";
import fs from "fs/promises";
import path from "path";
import createParser, { parseXMLToModel } from "@fem-viewer/parser";
import BaseService from "../baseService";
import { UPLOAD_DIR } from "../../../../../applicationPaths";

class ShowService extends BaseService {
	async execute() {
		const { modelGroupId } = this.req.params;
		const modelGroup = await this.db.modelGroup.findUnique({
			where: {
				id: modelGroupId,
			},
			include: {
				files: {
					select: {
						name: true,
					},
				},
			},
		});

		const response: {
			models: Model[];
			svgs: any[];
		} = { models: [], svgs: [] };

		await Promise.all(
			modelGroup.files.map(async (file) => {
				const pathToFile = path.join(
					UPLOAD_DIR,
					modelGroup.name,
					file.name
				);
				if (file.name.endsWith(".xml")) {
					const data = await fs.readFile(pathToFile, "utf-8");
					const parser = createParser(data);
					const models = parser.parseModels();
					response.models = models;
				}

				if (file.name.endsWith(".svg")) {
					const data = await fs.readFile(pathToFile, "utf-8");
					const jObj = parseXMLToModel(data, true);
					const normalizedName = file.name
						.replace(/.svg/, "")
						.trimEnd();
					response.svgs.push({ name: normalizedName, data: jObj });
				}
			})
		);
		return response;
	}
}

export default ShowService;
