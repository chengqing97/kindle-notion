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
const client_1 = require("@notionhq/client");
const fs_1 = __importDefault(require("fs"));
const parseClipping_1 = __importDefault(require("./parseClipping"));
const moment_1 = __importDefault(require("moment"));
const inquirer_1 = __importDefault(require("inquirer"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const chalk_1 = __importDefault(require("chalk"));
const confirmation = (options, numberOfClipping) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.import_all) {
        const answer = yield inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm_import_all",
                message: `Are you sure you want to import all ${numberOfClipping} clippings regardless of whether they have been imported previously?`,
                default: true,
            },
        ]);
        return answer.confirm_import_all;
    }
    else {
        const answer = yield inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: `Confirm syncing ${numberOfClipping} clippings?`,
                default: true,
            },
        ]);
        return answer.confirm;
    }
});
exports.default = (options, spinner) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    spinner.text = "Processing...";
    var fileContents = fs_1.default.readFileSync(options.clipping_path, "utf-8");
    let clippingJSON = (0, parseClipping_1.default)(fileContents);
    const notion = new client_1.Client({ auth: options.key });
    const lastClipping = yield notion.databases.query({
        database_id: options.database_id,
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 1,
    });
    const date = (_c = (_b = (_a = lastClipping.results) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.properties) === null || _c === void 0 ? void 0 : _c.Date;
    const lastClippingDate = date === null || date === void 0 ? void 0 : date.date.start;
    if (lastClippingDate && !options.import_all) {
        clippingJSON = clippingJSON.filter((obj) => (0, moment_1.default)(obj.date).isAfter(lastClippingDate, "minute"));
    }
    const numberOfClipping = clippingJSON.length;
    spinner.stop();
    if (numberOfClipping === 0)
        return console.log("Success! Your clipping is already in synced, no clipping is imported.");
    const confirmed = yield confirmation(options, numberOfClipping);
    if (!confirmed)
        return console.log("Canceled");
    const bar = new cli_progress_1.default.SingleBar({
        format: `${options.import_all ? "Importing" : "Syncing"} [{bar}] {percentage}% | {value}/{total}`,
    });
    const submitOne = (obj, index) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield notion.pages.create(objectToSubmit(obj, options.database_id));
            bar.increment();
        }
        catch (error) {
            console.error(error.body);
            console.log(obj);
            //await submitOne(obj);
        }
    });
    const submitAll = () => __awaiter(void 0, void 0, void 0, function* () {
        bar.start(numberOfClipping, 0);
        yield Promise.all(clippingJSON.map((obj, index) => __awaiter(void 0, void 0, void 0, function* () {
            yield submitOne(obj, index);
        })));
        bar.stop();
    });
    yield submitAll();
    console.log(chalk_1.default.bold("Done!"));
});
const objectToSubmit = (obj, databaseId) => {
    return {
        parent: { database_id: databaseId },
        properties: {
            Content: {
                title: [
                    {
                        text: {
                            content: obj.content,
                        },
                    },
                ],
            },
            Book: {
                rich_text: [
                    {
                        text: {
                            content: obj.book,
                        },
                    },
                ],
            },
            Author: {
                rich_text: [
                    {
                        text: {
                            content: obj.author,
                        },
                    },
                ],
            },
            Page: {
                rich_text: [
                    {
                        text: {
                            content: obj.page,
                        },
                    },
                ],
            },
            Location: {
                rich_text: [
                    {
                        text: {
                            content: obj.location,
                        },
                    },
                ],
            },
            Type: {
                select: {
                    name: obj.type,
                },
            },
            Date: {
                date: {
                    start: obj.date,
                },
            },
        },
    };
};
