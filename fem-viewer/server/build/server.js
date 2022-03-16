"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
var multer_1 = __importDefault(require("multer"));
var fs_1 = __importDefault(require("fs"));
var startup_1 = __importDefault(require("./startup"));
var crypto_1 = require("crypto");
dotenv_1.default.config();
(0, startup_1.default)();
var app = (0, express_1.default)();
var CLIENT_PATH = path_1.default.join(__dirname, "..", "..");
app.use(express_1.default.static(path_1.default.join(CLIENT_PATH, "build")));
app.use(express_1.default.static(path_1.default.join(CLIENT_PATH, "public")));
app.use(express_1.default.json());
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var modelGroupName = req.body.modelGroupName;
        var dirName = "uploads/".concat(modelGroupName);
        if (!fs_1.default.existsSync(dirName)) {
            fs_1.default.mkdirSync(dirName);
            var links = readLinks();
            links["links"][modelGroupName] = { links: [] };
            writeLinks(JSON.stringify(links));
        }
        cb(null, dirName);
    },
    filename: function (req, file, cb) {
        cb(null, "".concat(file.originalname));
    },
});
var upload = (0, multer_1.default)({ storage: storage });
app.post("/api/v1/upload", upload.array("files"), function (req, res, next) {
    var files = req.files;
    console.log(files);
    console.log(req.body);
    if (!files) {
        return next();
    }
    return res.status(200);
});
app.get("/api/v1/upload", function (_, res) {
    var uploadsDir = path_1.default.join(__dirname, "..", "uploads");
    fs_1.default.readdir(uploadsDir, function (err, files) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "No such model" });
        }
        var modelGroups = files.map(function (file) {
            var links = getModelGroupLinks(file);
            if (fs_1.default.lstatSync(path_1.default.join(uploadsDir, file)).isDirectory()) {
                return { name: file, links: links };
            }
        });
        res.json({ modelGroups: modelGroups });
    });
});
var readLinks = function () {
    var data = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "modelGroupLinks.json"));
    var links = JSON.parse(data.toString());
    return links;
};
var writeLinks = function (links) {
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "..", "modelGroupLinks.json"), links);
};
var getModelGroupLinks = function (modelGroupName) {
    var links = readLinks();
    if (links["links"][modelGroupName]) {
        console.log(links["links"][modelGroupName]["links"]);
        return links["links"][modelGroupName]["links"];
    }
    return [];
};
app.post("/api/v1/generatelink", function (req, res) {
    var modelGroupName = req.body.modelGroupName;
    var links = readLinks();
    links["links"][modelGroupName]["links"].push((0, crypto_1.randomUUID)());
    writeLinks(JSON.stringify(links));
    res.send({ name: modelGroupName, links: links["links"][modelGroupName] });
});
app.use(function (req, res, next) {
    res.sendFile(path_1.default.join(CLIENT_PATH, "build", "index.html"));
});
app.listen(process.env.PORT || 5000, function () {
    console.log("Server started on ".concat(process.env.PORT || 5000));
});
//# sourceMappingURL=server.js.map