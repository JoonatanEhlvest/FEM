import { Router } from "express";
import multer from "multer";
import storage from "../../../storage";
import db from "../../../db/index";
import { authorizeUser } from "./shared";
import { generateModelGroupName } from "../../../storage";
import { Prisma } from "@prisma/client";

const router = Router();

const upload = multer({ storage: storage() });
router.post(
	"/upload",
	authorizeUser,
	upload.array("files"),
	async (req, res, next) => {
		const files = req.files as Express.Multer.File[];
		if (!files) {
			return next();
		}

		const modelGroupName = generateModelGroupName(
			req.user.username,
			req.body.modelGroupName
		);

		try {
			await db.user.update({
				where: {
					id: req.user.id,
				},
				data: {
					modelGroups: {
						create: {
							owner: true,
							modelGroup: {
								create: {
									name: modelGroupName,
									files: {
										create: files.map((file) => ({
											name: file.originalname,
										})),
									},
								},
							},
						},
					},
				},
			});

			return res.status(200);
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
					return res.status(422).json({
						message: "Model group with this name already taken",
					});
				}
			}
		}
	}
);

router.get("/upload", authorizeUser, async (req, res) => {
	const modelGroups = await db.modelGroup.findMany({
		where: {
			users: {
				some: {
					userId: req.user.id,
				},
			},
		},
		select: {
			name: true,
		},
	});

	res.status(200).json({ modelGroups });
});

export default router;
