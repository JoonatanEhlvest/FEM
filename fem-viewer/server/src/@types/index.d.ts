import { UserRole } from "@prisma/client";

declare global {
	namespace Express {
		interface User {
			id: string;
			username: string;
			role: UserRole;
		}
	}
}
