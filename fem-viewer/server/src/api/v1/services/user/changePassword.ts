import { hashPassword } from "../../../../passportSetup";
import BaseService from "../baseService";

class ChangePasswordService extends BaseService {
	async execute() {
		const { password } = this.req.body;
		const id = this.req.user.id;

		hashPassword(password, async (hash) => {
			await this.db.user.update({
				where: {
					id,
				},
				data: {
					password: hash,
				},
			});
		});
	}
}

export default ChangePasswordService;
