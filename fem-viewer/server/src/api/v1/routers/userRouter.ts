import { Router } from "express";
import { authorizeUser } from "./shared";
import db from "../../../db";

const router = Router();

router.get("/user/:id", authorizeUser, async (req, res) => {
	const user = await db.user.findUnique({
		where: {
			id: req.params.id,
		},
		select: {
			username: true,
			modelGroups: {
				select: {
					modelGroup: {
						select: {
							name: true,
							id: true,
							shares: {
								where: {
									OR: [
										{ sharedByName: req.user.username },
										{ sharedToName: req.user.username },
									],
								},
							},
						},
					},
					owner: true,
				},
			},
		},
	});

	res.json({ user });
});

export default router;
