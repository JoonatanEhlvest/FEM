import { hashPassword } from "../../../../../passportSetup";
import UnauthorizedError from "../../../../../error/UnauthorizedError";
import BaseService from "../../baseService";

class ChangeCreatedUserPasswordService extends BaseService {
	async execute() {
		const { password } = this.req.body;
		const userId = this.req.params.userId;
		const currentUserId = this.req.user.id;

		// Find the user to update and verify the current user created them
		const userToUpdate = await this.db.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
				createdById: true,
			},
		});

		// Check if user exists and was created by the current user
		if (!userToUpdate) {
			throw new Error("User not found");
		}

		if (userToUpdate.createdById !== currentUserId) {
			throw new UnauthorizedError(
				"You can only change passwords of users you created"
			);
		}

		// Update the password
		return new Promise<void>((resolve, reject) => {
			hashPassword(password, async (hash) => {
				try {
					await this.db.user.update({
						where: {
							id: userId,
						},
						data: {
							password: hash,
						},
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}
}

export default ChangeCreatedUserPasswordService;
