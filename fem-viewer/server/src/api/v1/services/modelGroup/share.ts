import { UserRole } from "@prisma/client";
import UnauthorizedError from "../../../../error/UnauthorizedError";
import BaseService from "../baseService";

class ShareService extends BaseService {
	async execute() {
		const { usernameToShareWith, modelGroupId } = this.req.body;
		const userToShareWith = await this.db.user.findUnique({
			select: {
				createdById: true,
			},
			where: {
				username: usernameToShareWith,
			},
		});

		// Admin can share with anyone
		if (
			this.req.user.role !== UserRole.ADMIN &&
			this.req.user.id !== userToShareWith.createdById
		) {
			throw new UnauthorizedError(
				"The user you are trying to share the model with was not created by you"
			);
		}

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
