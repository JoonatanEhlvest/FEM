import { Router } from "express";
import { checkAuth, authorize } from "./shared";
import db from "../../../db";
import ShowService from "../services/user/show";

const router = Router();

router.get("/user/:id", [checkAuth], async (req, res) => {
	try {
		const service = new ShowService(req, db);
		const user = await service.execute();

		res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: err });
	}
});

export default router;
