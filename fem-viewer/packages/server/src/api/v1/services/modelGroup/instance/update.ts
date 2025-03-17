import { Model } from "@fem-viewer/types";
import BaseService from "../../baseService";
import UnauthorizedError from "../../../../../error/UnauthorizedError";
import ApplicationError from "../../../../../error/ApplicationError";
import fs from "fs/promises";
import path from "path";
import createParser, { parseXMLToModel, createXMLEditor } from "@fem-viewer/parser";
import { UPLOAD_DIR } from "../../../../../../applicationPaths";


class UpdateInstanceDescriptionService extends BaseService {
	async execute() {
		const { modelGroupId, instanceId } = this.req.params;
		const { description } = this.req.body;

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

		if (!modelGroup) {
			throw new ApplicationError("Model group not found", 404);
		}

		// Check if user has access to this model group
		const userModelGroup = await this.db.modelGroupsOnUsers.findFirst({
            where: {
                modelGroupId,
				userId: this.req.user.id,
			},
		});

		if (!userModelGroup) {
			throw new UnauthorizedError(
				"User does not have access to this model group"
			);
		}

		// Read the xml file
		const xmlFile = modelGroup.files.find(file => file.name.endsWith(".xml"));
        if (!xmlFile) {
            throw new ApplicationError("XML file not found", 404);
        }

		const xmlFilePath = path.join(UPLOAD_DIR, modelGroup.name, xmlFile.name);

		const xmlData = await fs.readFile(xmlFilePath, "utf-8");

		const editor = createXMLEditor(xmlData, { preserveDoctype: true });
		
		const result = editor.updateInstanceDescription(instanceId, description);
		
		if (!result.success) {
			throw new ApplicationError(result.error || "Failed to update instance description", 400);
		}
		
		// Write the updated XML back to the file
		await fs.writeFile(xmlFilePath, result.xml);
		
		// Parse the updated XML to get the models for the response
		const parser = createParser(result.xml);
		const models = parser.parseModels();

		const response: {
			models: Model[];
		} = { models};
		
		return response;
	}
}

export default UpdateInstanceDescriptionService;
