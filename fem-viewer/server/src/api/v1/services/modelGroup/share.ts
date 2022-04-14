import BaseService from "../baseService";

class ShareService extends BaseService {
	async execute() {
		const { usernameToShareWith, modelGroupId } = this.req.body;
		await this.db.modelGroupsOnUsers.create({
			data: {
				user: {
					connect: {
						username: usernameToShareWith,
					},
				},
				owner: false,
				modelGroup: {
					connect: {
						id: modelGroupId,
					},
				},
			},
		});

		await this.db.share.create({
			data: {
				sharedByName: this.req.user.username,
				sharedToName: usernameToShareWith,
				modelGroupId: modelGroupId,
			},
		});
	}
}

export default ShareService;
