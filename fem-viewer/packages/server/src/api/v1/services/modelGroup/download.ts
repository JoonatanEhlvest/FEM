import UnauthorizedError from "../../../../error/UnauthorizedError";
import BaseService from "../baseService";
import fs from "fs";
import path from "path";
import ApplicationError from "../../../../error/ApplicationError";
import { UPLOAD_DIR } from "../../../../../applicationPaths";

class DownloadService extends BaseService {
	async execute() {
		const { modelGroupId } = this.req.params;

		// Check if the modelGroup exists
		const modelGroup = await this.db.modelGroup.findUnique({
			where: { id: modelGroupId },
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
				"You don't have access to this model group"
			);
		}

		// Find the XML file
		const xmlFile = modelGroup.files.find((file) =>
			file.name.endsWith(".xml")
		);

		if (!xmlFile) {
			throw new ApplicationError("XML file not found", 404);
		}

		// Get the file path
		const filePath = path.join(UPLOAD_DIR, modelGroup.name, xmlFile.name);

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			throw new ApplicationError("Model group file not found", 404);
		}

		return {
			filePath,
			fileName: `${modelGroup.name}.xml`,
		};
	}
}

export default DownloadService;
