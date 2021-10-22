"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const arg_1 = __importDefault(require("arg"));
const inquirer_1 = __importDefault(require("inquirer"));
const index_1 = __importDefault(require("./index"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@notionhq/client");
const os_1 = __importDefault(require("os"));
const ora_1 = __importDefault(require("ora"));
const userDataPath = path_1.default.resolve(__dirname, "../userData.json");
const helpTextPath = path_1.default.resolve(__dirname, "../help.txt");
const kindlePath = `/media/${os_1.default.userInfo().username}/Kindle`;
const parseRawArguments = (rawArgs) => {
    const args = (0, arg_1.default)({
        "--all": Boolean,
        "--help": Boolean,
        "-a": "--all",
        "-h": "--help",
    }, {
        argv: rawArgs.slice(2),
    });
    return {
        help: args["--help"] || false,
        import_all: args["--all"] || false,
    };
};
const promptDbIntoInput = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield inquirer_1.default.prompt([
        {
            type: "input",
            name: "database_id",
            message: "Notion database id:",
            default: null,
            validate: (input) => input && input.length > 10,
        },
        {
            type: "input",
            name: "key",
            message: "Notion integration key:",
            default: null,
            validate: (input) => input && input.length > 10,
        },
    ]);
});
const promptSelectDb = (databases) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const answer = yield inquirer_1.default.prompt({
        type: "list",
        name: "selected_db",
        message: "Which database do you want to import to:",
        choices: () => {
            return [
                ...databases.map((obj) => {
                    return { name: obj.name, value: { database_id: obj.database_id, key: obj.key } };
                }),
                { name: "Import to new database", value: { database_id: "new" } },
            ];
        },
    });
    if (((_a = answer.selected_db) === null || _a === void 0 ? void 0 : _a.database_id) == "new") {
        return yield promptDbIntoInput();
    }
    else {
        return answer.selected_db;
    }
});
const cli = (rawArgs) => __awaiter(void 0, void 0, void 0, function* () {
    const args = parseRawArguments(rawArgs);
    if (args.help) {
        return console.log(fs_1.default.readFileSync(helpTextPath, "utf8"));
    }
    let options = Object.assign({}, args);
    if (!fs_1.default.existsSync(kindlePath)) {
        return console.log("Please connect your Kindle to your computer.");
    }
    options = Object.assign(Object.assign({}, options), { clipping_path: `${kindlePath}/documents/My Clippings.txt` });
    if (!fs_1.default.existsSync(userDataPath))
        fs_1.default.writeFileSync(userDataPath, JSON.stringify([]));
    let databases = JSON.parse(fs_1.default.readFileSync(userDataPath, "utf8"));
    if (databases.length > 0) {
        options = Object.assign(Object.assign({}, options), (yield promptSelectDb(databases)));
    }
    else {
        options = Object.assign(Object.assign({}, options), (yield promptDbIntoInput()));
    }
    //console.log(cliSpinners.dots, "Verifying...");
    const spinner = (0, ora_1.default)("Verifying...");
    const notion = new client_1.Client({ auth: options.key });
    try {
        spinner.start();
        const targetDatabase = yield notion.databases.retrieve({ database_id: options.database_id });
        const user = yield notion.users.list({});
        const databaseName = `${targetDatabase.title[0].plain_text} - ${user.results[0].name}`;
        const toStore = {
            database_id: options.database_id,
            key: options.key,
            name: databaseName,
        };
        if (databases.find((obj) => obj.database_id === options.database_id)) {
            //update name
            databases = databases.map((obj) => {
                if (obj.database_id === options.database_id) {
                    return toStore;
                }
                else
                    return obj;
            });
        }
        else {
            databases.push(toStore);
        }
        fs_1.default.writeFileSync(userDataPath, JSON.stringify(databases));
        yield (0, index_1.default)(options, spinner);
    }
    catch (error) {
        spinner.stop();
        console.log(error.body);
    }
});
exports.cli = cli;
