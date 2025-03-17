import ApplicationError from "../../../../error/ApplicationError";
import UnauthorizedError from "../../../../error/UnauthorizedError";
import BaseService from "../baseService";

class DeleteService extends BaseService {
	async execute() {
		const { modelGroupId } = this.req.params;
		const { modelGroupName } = this.req.body;
		
		// First check if the model group exists
		const existingModelGroup = await this.db.modelGroup.findUnique({
			where: {
				id: modelGroupId,
			}
		});

		if (!existingModelGroup) {
			throw new ApplicationError("Model group not found", 404);
		}

		// Check if the user is the owner of the model group
		const userModelGroup = await this.db.modelGroupsOnUsers.findFirst({
			where: {
				modelGroupId: modelGroupId,
				userId: this.req.user.id,
				owner: true
			}
		});

		// Only allow the owner to delete the model group
		if (!userModelGroup) {
			throw new UnauthorizedError("You are not authorized to delete this model group");
		}

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
				name: modelGroupName,
			},
		});

		return modelGroup;
	}
}

export default DeleteService;
