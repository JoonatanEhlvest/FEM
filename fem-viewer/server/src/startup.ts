import fs from "fs";

const requiredDirs = ["uploads"];
const requiredFiles = ["modelGroupLinks.json"];
export default () => {
	requiredFiles.forEach((file) => {
		if (!fs.existsSync(file)) {
			fs.writeFileSync(file, '{"links": {}}');
		}
	});

	requiredDirs.forEach((dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	});
};
