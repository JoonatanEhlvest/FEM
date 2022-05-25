import BaseService from "../baseService";

class DeleteService extends BaseService {
	async execute() {
		const { modelGroupId } = this.req.params;
		const { modelGroupName } = this.req.body;
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
