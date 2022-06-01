import BaseService from "../../baseService";

class DeleteService extends BaseService {
	async execute() {
		const { modelGroupId, sharedToName } = this.req.body;

		const share = await this.db.share.delete({
			where: {
				sharedToName_modelGroupId_sharedByName: {
					sharedByName: this.req.user.username,
					sharedToName,
					modelGroupId,
				},
			},
			select: {
				sharedToName: true,
				modelGroupId: true,
			},
		});

		const user = await this.db.user.findUnique({
			where: {
				username: sharedToName,
			},
			select: {
				id: true,
			},
		});

		await this.db.modelGroupsOnUsers.delete({
			where: {
				modelGroupId_userId: {
					modelGroupId,
					userId: user.id,
				},
			},
		});

		return share;
	}
}

export default DeleteService;
