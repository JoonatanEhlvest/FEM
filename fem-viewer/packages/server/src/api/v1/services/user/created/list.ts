import BaseService from "../../baseService";

class ListService extends BaseService {
	async execute() {
		const { createdById } = this.req.params;

		const users = await this.db.user.findMany({
			where: {
				createdById,
			},
			select: {
				id: true,
				username: true,
				role: true,
			},
		});

		return users;
	}
}

export default ListService;
