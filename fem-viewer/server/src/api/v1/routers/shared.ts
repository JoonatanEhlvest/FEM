import { NextFunction, Request, Response } from "express";

export const authorizeUser = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ message: "You are not authenticated" });
	}

	next();
};
