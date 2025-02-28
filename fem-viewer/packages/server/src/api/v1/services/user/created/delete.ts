import UnauthorizedError from "../../../../../error/UnauthorizedError";
import BaseService from "../../baseService";

class DeleteService extends BaseService {
	async execute() {
		const createdById = this.req.user.id;
		const { toDeleteId } = this.req.params;

		const user = await this.db.user.findUnique({
			where: {
				id: toDeleteId,
			},
			select: {
				createdById: true,
				id: true,
			},
		});

		if (user.createdById !== createdById) {
			throw new UnauthorizedError(
				"You are not authorized to delete this user"
			);
		}

		const deletedUser = await this.db.user.delete({
			where: {
				id: user.id,
			},
			select: {
				id: true,
			},
		});

		return deletedUser;
	}
}

export default DeleteService;
