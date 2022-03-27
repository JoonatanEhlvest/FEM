import { Router } from "express";
import { authorizeUser } from "./shared";
import db from "../../../db";
import { Prisma } from "@prisma/client";
import path from "path";
import { UPLOAD_DIR } from "../../../../applicationPaths";
import { parseXMLToModel } from "../../../../../src/parser/index";
import fs from "fs/promises";

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

router.get("/modelgroup/:modelGroupId", async (req, res) => {
	try {
		const { modelGroupId } = req.params;
		const modelGroup = await db.modelGroup.findUnique({
			where: {
				id: modelGroupId,
			},
			include: {
				files: {
					select: {
						name: true,
					},
				},
			},
		});

		const response: {
			xml: any;
			svgs: any[];
		} = { xml: null, svgs: [] };

		await Promise.all(
			modelGroup.files.map(async (file) => {
				const pathToFile = path.join(
					UPLOAD_DIR,
					modelGroup.name,
					file.name
				);
				if (file.name.endsWith(".xml")) {
					const data = await fs.readFile(pathToFile, "utf-8");
					const jObj = parseXMLToModel(data);
					response.xml = jObj;
				}

				if (file.name.endsWith(".svg")) {
					const data = await fs.readFile(pathToFile, "utf-8");
					const jObj = parseXMLToModel(data);
					const normalizedName = file.name
						.replace(/.svg/, "")
						.trimEnd();
					response.svgs.push({ name: normalizedName, data: jObj });
				}
			})
		);

		return res.json({ data: response });
	} catch (err) {
		res.status(422).json({ message: err });
	}
});

export default router;
