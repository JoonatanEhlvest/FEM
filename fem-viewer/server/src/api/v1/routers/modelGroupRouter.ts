import { Router } from "express";
import { authorizeUser } from "./shared";
import db from "../../../db";
import { Prisma } from "@prisma/client";

const router = Router();

router.patch("/modelgroup/share", authorizeUser, async (req, res) => {
	const { usernameToShareWith, modelGroupId } = req.body;

	try {
		const result = await db.modelGroupsOnUsers.create({
			data: {
				user: {
					connect: {
						username: usernameToShareWith,
					},
				},
				owner: false,
				modelGroup: {
					connect: {
						id: modelGroupId,
					},
				},
			},
		});

		await db.share.create({
			data: {
				sharedByName: req.user.username,
				sharedToName: usernameToShareWith,
				modelGroupId: modelGroupId,
			},
		});

		console.log(result);

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

export default router;
