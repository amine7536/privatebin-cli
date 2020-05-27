"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const cmd_1 = require("./cmd");
cmd_1.CLI(process).catch((error) => {
    process.stderr.write(chalk_1.default `{red ERROR:} ${error.message}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map