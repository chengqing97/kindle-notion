"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const dateParser = (kindleDate) => {
    return (0, moment_1.default)(kindleDate, "dddd, MMMM DD, YYYY hh:mm:ss A").format();
};
exports.default = (clippingString) => {
    const itemsArray = clippingString.split("\r\n==========\r\n");
    itemsArray.pop();
    return itemsArray.map((item) => {
        const lines = item.split("\r\n");
        return {
            book: lines[0].split(" (")[0],
            author: lines[0]
                .match(/\(([^()]*)\)/)[0]
                .replace("(", "")
                .replace(")", ""),
            content: lines[3],
            type: lines[1].match(/(?<=Your\s)(\w+)/)[0],
            page: lines[1].match(/(?<=page\s)(\S+)/) ? lines[1].match(/(?<=page\s)(\w+)/)[0] : "",
            location: lines[1].match(/(?<=Location\s)(\S+)/)[0],
            oriDate: lines[1].match(/(?<=Added on\s).*/)[0],
            date: dateParser(lines[1].match(/(?<=Added on\s).*/)[0]),
        };
    });
};
