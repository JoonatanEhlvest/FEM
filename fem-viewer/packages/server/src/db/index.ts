import { PrismaClient } from "@prisma/client";
import { UPLOAD_DIR } from "../../applicationPaths";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();


// When user is deleted delete all owned modelgroups from db and file system
prisma.$use(async (params, next) => {
	if (params.model === "User" && params.action === "delete") {
		const modelGroups = await prisma.modelGroup.findMany({
			where: {
				users: {
					some: {
						owner: true,
						userId: params.args.where.id,
					},
				},
			},
			select: {
				id: true,
				name: true,
			},
		});

		const ids = [];
		const names = [];

		modelGroups.forEach((m) => {
			ids.push(m.id);
			names.push(m.name);
		});

		await prisma.modelGroup.deleteMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		names.forEach(async (name) => {
			await fs.rm(path.join(UPLOAD_DIR, name), {
				recursive: true,
			});
		});
	}
	return next(params);
});


// When modelgroup is deleted delete modelgroup from filesystem
prisma.$use(async (params, next) => {
	if (params.model === "ModelGroup" && params.action === "delete") {
		await fs.rm(path.join(UPLOAD_DIR, params.args.where.name), {
			recursive: true,
		});
	}
	return next(params);
});

export default prisma;
