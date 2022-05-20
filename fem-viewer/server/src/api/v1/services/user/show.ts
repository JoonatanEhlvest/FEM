import BaseService from "../baseService";

class ShowService extends BaseService {
	async execute() {
		const user = await this.db.user.findUnique({
			where: {
				id: this.req.params.id,
			},
			select: {
				username: true,
				role: true,
				modelGroups: {
					select: {
						modelGroup: {
							select: {
								name: true,
								id: true,
								shares: {
									where: {
										OR: [
											{
												sharedByName:
													this.req.user.username,
											},
											{
												sharedToName:
													this.req.user.username,
											},
										],
									},
								},
							},
						},
						owner: true,
					},
				},
			},
		});
		return user;
	}
}

export default ShowService;
