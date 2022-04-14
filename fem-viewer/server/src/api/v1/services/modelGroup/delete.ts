import { UPLOAD_DIR } from "../../../../../applicationPaths";
import path from "path";
import BaseService from "../baseService";
import fs from "fs/promises";

class DeleteService extends BaseService {
	async execute() {
		const { modelGroupId } = this.req.params;
		await this.db.modelGroupsOnUsers.deleteMany({
			where: {
				modelGroupId: modelGroupId,
			},
		});

		await this.db.share.deleteMany({
			where: {
				modelGroupId: modelGroupId,
			},
		});

		const modelGroup = await this.db.modelGroup.delete({
			where: {
				id: modelGroupId,
			},
		});

		await fs.rm(path.join(UPLOAD_DIR, modelGroup.name), {
			recursive: true,
		});

		return modelGroup;
	}
}

export default DeleteService;
