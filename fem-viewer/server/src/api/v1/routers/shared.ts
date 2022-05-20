import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	if (!req.isAuthenticated()) {
		return res.status(403).json({ message: "You are not authenticated" });
	}

	next();
};

export const authorize = (rolesAllowed: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!rolesAllowed.includes(req.user.role)) {
			return res
				.status(401)
				.json({ message: "You cannot access this route" });
		}
		next();
	};
};
