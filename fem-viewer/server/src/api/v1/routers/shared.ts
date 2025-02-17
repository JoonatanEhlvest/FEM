import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.isAuthenticated()) {
		res.status(403).json({ message: "You are not authenticated" });
		return;
	}

	next();
};

export const authorize = (rolesAllowed: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!rolesAllowed.includes(req.user.role)) {
			res.status(401).json({ message: "You cannot access this route" });
			return;
		}
		next();
	};
};
