import fs from "fs";

const requiredDirs = ["uploads"];
const requiredFiles: string[] = [];
export default () => {
	requiredDirs.forEach((dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	});
};
