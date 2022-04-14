import { Router } from "express";
import { authorizeUser } from "./shared";
import db from "../../../db";
import { Prisma } from "@prisma/client";
import ShowService from "../services/modelGroup/show";
import ShareService from "../services/modelGroup/share";
import DeleteService from "../services/modelGroup/delete";

const router = Router();

router.patch("/modelgroup/share", authorizeUser, async (req, res) => {
	const { usernameToShareWith } = req.body;

	if (usernameToShareWith === req.user.username) {
		return res
			.status(422)
			.json({ message: "Can't share a model with yourself" });
	}

	try {
		const service = new ShareService(req, db);
		await service.execute();
		return res.status(200).end();
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2002") {
				return res.status(422).json({
					message: "Already shared this model with this user",
				});
			}
			if (err.code === "P2025") {
				return res.status(422).json({
					message: "No such user found",
				});
			}
		}

		return res.status(500).json({ message: err });
	}
});

router.get("/modelgroup/:modelGroupId", async (req, res) => {
	const service = new ShowService(req, db);
	try {
		const response = await service.execute();

		return res.json({ data: response });
	} catch (err) {
		res.status(422).json({ message: err });
	}
});

router.delete(
	"/modelgroup/:modelGroupId",
	authorizeUser,
	async (req, res, next) => {
		try {
			const service = new DeleteService(req, db);
			const modelGroup = await service.execute();

			return res.json({ modelGroup });
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				message: "Couldn't delete model group. Please try again",
			});
		}
	}
);

export default router;
