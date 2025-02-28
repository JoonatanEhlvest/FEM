import { Request, Response, Router, NextFunction } from "express";
import multer from "multer";
import storage from "../../../storage";
import db from "../../../db/index";
import { checkAuth } from "./shared";
import { generateModelGroupName } from "../../../storage";
import { Prisma } from "@prisma/client";
import fs from "fs/promises";
import createParser from "../../../../../src/parser";
import { UPLOAD_DIR } from "../../../../applicationPaths";
import path from "path";

const router = Router();

const upload = multer({
	storage: storage(),
});

const uploadArray = upload.array("files");

router.post("/upload", checkAuth, async (req: Request, res: Response, next: NextFunction) => {
	uploadArray(req, res, async (err) => {
		if (err) {
			res.status(422).json({ message: err.message });
			return;
		}
		const files = req.files as Express.Multer.File[];
		if (!files) {
			next();
			return;
		}

		if (req.body.modelGroupName.length < 1) {
			res.status(422).json({ message: "Please include a name for the model group" });
			return;
		}

		const modelGroupName = generateModelGroupName(
			req.user.username,
			req.body.modelGroupName
		);
		const xml = files.find((f) => f.originalname.endsWith(".xml"));
		try {
			if (xml) {
				const data = await fs.readFile(xml.path, "utf-8");
				createParser(data).getModels();
			} else {
				await fs.rm(path.join(UPLOAD_DIR, modelGroupName), {
					recursive: true,
				});
				res.status(422).json({ message: "No xml file provided" });
				return;
			}
		} catch (err) {
			await fs.rm(path.join(UPLOAD_DIR, modelGroupName), {
				recursive: true,
			});
			res.status(422).json({ message: `Couldn't parse ${xml.originalname}` });
			return;
		}

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

			res.status(200).end();
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
					res.status(422).json({
						message: "Model group with this name already taken",
					});
					return;
				}
			}
		}
	});
});

router.get("/upload", checkAuth, async (req: Request, res: Response) => {
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
