import { Request, Response, Router } from "express";
import { authorize, checkAuth } from "./shared";
import db from "../../../db";
import { Prisma } from "@prisma/client";
import ShowService from "../services/modelGroup/show";
import ShareService from "../services/modelGroup/share";
import DeleteService from "../services/modelGroup/delete";
import ShareDeleteService from "../services/modelGroup/share/delete";
import ApplicationError from "../../../error/ApplicationError";
import UpdateInstanceDescriptionService from "../services/modelGroup/instance/updateDescription";
import UpdateInstanceSubclassService from "../services/modelGroup/instance/subclass/updateSubclass";
import UpdateInstanceBSubclassService from "../services/modelGroup/instance/subclass/updateBSubclass";
import DownloadService from "../services/modelGroup/download";

const router = Router();

router.patch(
	"/modelgroup/share",
	[checkAuth, authorize(["ADMIN", "DEVELOPER"])],
	async (req: Request, res: Response) => {
		const { usernameToShareWith } = req.body;

		if (usernameToShareWith === req.user.username) {
			res.status(422).json({
				message: "Can't share a model with yourself",
			});
			return;
		}

		try {
			const service = new ShareService(req, db);
			const response = await service.execute();
			res.status(200).json(response);
			return;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
					res.status(422).json({
						message: "Already shared this model with this user",
					});
					return;
				}
				if (err.code === "P2025") {
					res.status(422).json({
						message: "No such user found",
					});
					return;
				}
			}
			if (err instanceof ApplicationError) {
				res.status(err.code).json({
					message: err.message,
				});
				return;
			}

			res.status(500).json({ message: err });
		}
	}
);

router.delete(
	"/modelgroup/share",
	[checkAuth, authorize(["ADMIN", "DEVELOPER"])],
	async (req: Request, res: Response) => {
		const service = new ShareDeleteService(req, db);
		try {
			const response = await service.execute();
			res.json(response);
		} catch (err) {
			if (err instanceof Error) {
				res.status(422).json({ message: err.message });
			} else {
				res.status(422).json({ message: err });
			}
		}
	}
);

router.get("/modelgroup/:modelGroupId", async (req: Request, res: Response) => {
	const service = new ShowService(req, db);
	try {
		const response = await service.execute();
		res.json({ data: response });
	} catch (err) {
		if (err instanceof Error) {
			res.status(422).json({ message: err.message });
		} else {
			res.status(422).json({ message: err });
		}
	}
});

router.delete(
	"/modelgroup/:modelGroupId",
	[checkAuth, authorize(["ADMIN", "DEVELOPER"])],
	async (req: Request, res: Response) => {
		try {
			const service = new DeleteService(req, db);
			const modelGroup = await service.execute();
			res.json({ modelGroup });
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: "Couldn't delete model group. Please try again",
			});
		}
	}
);

/**
 * Updates the description of an instance (node) in a model group
 * req: {
 * 	modelGroupId: string;
 * 	instanceId: string;
 * 	description: string;
 * }
 */
router.patch(
	"/modelgroup/:modelGroupId/instance/:instanceId/description",
	[checkAuth, authorize(["ADMIN", "DEVELOPER", "EXPERT"])],
	async (req: Request, res: Response) => {
		try {
			const service = new UpdateInstanceDescriptionService(req, db);
			const response = await service.execute();
			res.json(response);
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: `Couldn't update instance description: ${err}`,
			});
		}
	}
);

/**
 * Updates the subclass and color picker mode of an instance (node) in a model group
 * req: {
 * 	modelGroupId: string;
 * 	instanceId: string;
 * 	colorPickerMode: "Default" | "Individual" | "Subclass"; // The color picker mode to set
 * 	subclassInstanceId?: string; // Required only when colorPickerMode is "Subclass"
 * }
 */
router.patch(
	"/modelgroup/:modelGroupId/instance/:instanceId/subclass",
	[checkAuth, authorize(["ADMIN", "DEVELOPER", "EXPERT"])],
	async (req: Request, res: Response) => {
		try {
			const service = new UpdateInstanceSubclassService(req, db);
			const response = await service.execute();
			res.json(response);
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: `Couldn't update instance subclass: ${err}`,
			});
		}
	}
);

/**
 * Updates the border subclass and border color picker mode of an instance (node) in a model group
 * req: {
 * 	modelGroupId: string;
 * 	instanceId: string;
 * 	colorPickerMode: "Individual" | "Subclass"; // The border color picker mode to set
 * 	bsubclassInstanceId?: string; // Required only when colorPickerMode is "Subclass"
 * }
 */
router.patch(
	"/modelgroup/:modelGroupId/instance/:instanceId/bsubclass",
	[checkAuth, authorize(["ADMIN", "DEVELOPER", "EXPERT"])],
	async (req: Request, res: Response) => {
		try {
			const service = new UpdateInstanceBSubclassService(req, db);
			const response = await service.execute();
			res.json(response);
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: `Couldn't update instance border subclass: ${err}`,
			});
		}
	}
);

/**
 * Download the XML file of a model group
 * GET /modelgroup/:modelGroupId/download
 */
router.get(
	"/modelgroup/:modelGroupId/download",
	[checkAuth],
	async (req: Request, res: Response) => {
		try {
			const service = new DownloadService(req, db);
			const { filePath, fileName } = await service.execute();

			// Add custom header with filename
			res.setHeader("X-Filename", fileName);
			res.download(filePath, fileName);
		} catch (err) {
			console.log(err);
			if (err instanceof ApplicationError) {
				res.status(err.code).json({
					message: err.message,
				});
				return;
			}
			res.status(500).json({
				message: "Couldn't download model group. Please try again",
			});
		}
	}
);

export default router;
