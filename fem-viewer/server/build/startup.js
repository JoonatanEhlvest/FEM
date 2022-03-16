"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var requiredDirs = ["uploads"];
var requiredFiles = ["modelGroupLinks.json"];
exports.default = (function () {
    requiredFiles.forEach(function (file) {
        if (!fs_1.default.existsSync(file)) {
            fs_1.default.writeFileSync(file, '{"links": {}}');
        }
    });
    requiredDirs.forEach(function (dir) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
    });
});
//# sourceMappingURL=startup.js.map