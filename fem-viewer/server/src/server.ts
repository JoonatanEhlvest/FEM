import express from "express";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import startup from "./startup";
import { randomUUID } from "crypto";
import createParser, { Parser } from "../../src/parser/index";
import { XMLParser } from "fast-xml-parser";
import { ATTR_PREFIX } from "../../src/utlitity";

dotenv.config();

startup();

const app = express();

const CLIENT_PATH = path.join(__dirname, "..", "..");

app.use(express.static(path.join(CLIENT_PATH, "build")));
app.use(express.static(path.join(CLIENT_PATH, "public")));
app.use(express.json());

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const modelGroupName = req.body.modelGroupName;
		const dirName = `uploads/${modelGroupName}`;
		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName);
			const links = readLinks();
			links["links"][modelGroupName] = { links: [] };
			writeLinks(JSON.stringify(links));
		}
		cb(null, dirName);
	},
	filename: (req, file, cb) => {
		cb(null, `${file.originalname}`);
	},
});

const upload = multer({ storage });
app.post("/api/v1/upload", upload.array("files"), (req, res, next) => {
	const files = req.files;
	console.log(files);
	console.log(req.body);
	if (!files) {
		return next();
	}
	return res.status(200);
});

app.get("/api/v1/upload", (_, res) => {
	const uploadsDir = path.join(__dirname, "..", "uploads");
	fs.readdir(uploadsDir, (err, files) => {
		if (err) {
			console.log(err);
			return res.status(400).json({ error: "No such model" });
		}

		const modelGroups = files.map((file) => {
			const links = getModelGroupLinks(file);

			if (fs.lstatSync(path.join(uploadsDir, file)).isDirectory()) {
				return { name: file, links };
			}
		});
		res.json({ modelGroups });
	});
});

const findModelGroupByLinkId = (linkID: string): string | null => {
	const links = readLinks();
	const modelGroups = Object.keys(links["links"]);

	for (const modelGroup of modelGroups) {
		if (
			links["links"][modelGroup]["links"].find(
				(id: string) => id === linkID
			)
		) {
			return modelGroup;
		}
	}
	return null;
};

app.get("/api/v1/modelgroups/:linkID", (req, res) => {
	const { linkID } = req.params;
	console.log(linkID);

	const modelGroup = findModelGroupByLinkId(linkID);

	if (modelGroup) {
		fs.readdir(path.join("uploads", modelGroup), (err, files) => {
			if (err) {
				return res.status(500).json({
					message: "Unable to scan files",
				});
			}
			files.forEach((file) => {
				if (file.endsWith(".xml")) {
					const xml = fs.readFile(
						path.join("uploads", modelGroup, file),
						"utf-8",
						(err, data) => {
							if (err) {
								return res.status(500).json({
									message: "Unable to read file",
								});
							}

							const options = {
								ignoreAttributes: false,
								attributeNamePrefix: ATTR_PREFIX,
							};
							const parser = new XMLParser(options);

							const xml: string = data;
							const jObj = parser.parse(xml);

							return res.json({ xml: jObj });
						}
					);
				}
			});
		});
	} else {
		return res.status(404).json({ error: "No modelGroup found for link" });
	}
});

const readLinks = () => {
	const data = fs.readFileSync(
		path.join(__dirname, "..", "modelGroupLinks.json")
	);

	const links = JSON.parse(data.toString());
	return links;
};

const writeLinks = (links: string) => {
	fs.writeFileSync(path.join(__dirname, "..", "modelGroupLinks.json"), links);
};

const getModelGroupLinks = (modelGroupName: string) => {
	const links = readLinks();
	if (links["links"][modelGroupName]) {
		return links["links"][modelGroupName]["links"];
	}
	return [];
};

app.post("/api/v1/generatelink", (req, res) => {
	const { modelGroupName } = req.body;
	const links = readLinks();

	links["links"][modelGroupName]["links"].push(randomUUID());
	writeLinks(JSON.stringify(links));
	res.send({ name: modelGroupName, links: links["links"][modelGroupName] });
});

app.use((req, res, next) => {
	res.sendFile(path.join(CLIENT_PATH, "build", "index.html"));
});

app.listen(process.env.PORT || 5000, () => {
	console.log(`Server started on ${process.env.PORT || 5000}`);
});
