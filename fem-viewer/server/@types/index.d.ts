import { User as PrismaUser } from "@prisma/client";

// Type for data stored in session
export interface SerializedUser {
	id: string;
	username: string;
	role: PrismaUser['role'];
	createdById: PrismaUser['createdById'];
}

declare global {
	namespace Express {
		// req.user will have all PrismaUser fields
		export interface User extends PrismaUser {}
	}
}

export {};
