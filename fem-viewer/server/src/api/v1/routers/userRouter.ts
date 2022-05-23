import { Router } from "express";
import { checkAuth, authorize } from "./shared";
import db from "../../../db";
import ShowService from "../services/user/show";
import ListService from "../services/user/created/list";

const router = Router();

router.get(
	"/user/created/:createdById",
	[authorize(["ADMIN", "DEVELOPER"])],
	async (req, res) => {
		try {
			const service = new ListService(req, db);
			const users = await service.execute();
			res.json({ users });
		} catch (err) {
			return res.status(500).json({ message: err.message });
		}
	}
);

router.get("/user/:id", [checkAuth], async (req, res) => {
	try {
		const service = new ShowService(req, db);
		const user = await service.execute();

		res.json({ user });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

export default router;
