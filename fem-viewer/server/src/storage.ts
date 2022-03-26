import { UPLOAD_DIR } from "../applicationPaths";
import fs from "fs";
import multer from "multer";
import path from "path";
import db from "./db";

export const generateModelGroupName = (
	username: string,
	modelGroupName: string
): string => {
	return `${modelGroupName}-${username}`;
};

const storage = () => {
	return multer.diskStorage({
		destination: async (req, file, cb) => {
			const modelGroupName = req.body.modelGroupName;
			const dirName = path.join(
				UPLOAD_DIR,
				generateModelGroupName(req.user.username, modelGroupName)
			);
			if (!fs.existsSync(dirName)) {
				fs.mkdirSync(dirName);
			}

			cb(null, dirName);
		},
		filename: async (req, file, cb) => {
			cb(null, `${file.originalname}`);
		},
	});
};

export default storage;
