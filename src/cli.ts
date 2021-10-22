import arg from "arg";
import inquirer from "inquirer";
import index from "./index";
import fs from "fs";
import path from "path";
import { Options } from "./global";
import { Client } from "@notionhq/client";
import os from "os";
import ora from "ora";

const userDataPath = path.resolve(__dirname, "../userData.json");
const helpTextPath = path.resolve(__dirname, "../help.txt");
const kindlePath = `/media/${os.userInfo().username}/Kindle`;

const parseRawArguments = (rawArgs) => {
  const args = arg(
    {
      "--all": Boolean,
      "--help": Boolean,
      "-a": "--all",
      "-h": "--help",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    help: args["--help"] || false,
    import_all: args["--all"] || false,
  };
};

const promptDbIntoInput = async () => {
  return await inquirer.prompt([
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
};

const promptSelectDb = async (databases) => {
  const answer = await inquirer.prompt({
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
  if (answer.selected_db?.database_id == "new") {
    return await promptDbIntoInput();
  } else {
    return answer.selected_db;
  }
};

export const cli = async (rawArgs) => {
  const args = parseRawArguments(rawArgs);

  if (args.help) {
    return console.log(fs.readFileSync(helpTextPath, "utf8"));
  }

  let options: Options = { ...args };

  if (!fs.existsSync(kindlePath)) {
    return console.log("Please connect your Kindle to your computer.");
  }

  options = { ...options, clipping_path: `${kindlePath}/documents/My Clippings.txt` };

  if (!fs.existsSync(userDataPath)) fs.writeFileSync(userDataPath, JSON.stringify([]));
  let databases = JSON.parse(fs.readFileSync(userDataPath, "utf8"));

  if (databases.length > 0) {
    options = { ...options, ...(await promptSelectDb(databases)) };
  } else {
    options = { ...options, ...(await promptDbIntoInput()) };
  }

  //console.log(cliSpinners.dots, "Verifying...");

  const spinner = ora("Verifying...");
  const notion = new Client({ auth: options.key });
  try {
    spinner.start();
    const targetDatabase = await notion.databases.retrieve({ database_id: options.database_id });
    const user = await notion.users.list({});
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
        } else return obj;
      });
    } else {
      databases.push(toStore);
    }
    fs.writeFileSync(userDataPath, JSON.stringify(databases));
    await index(options, spinner);
  } catch (error) {
    spinner.stop();
    console.log(error.body);
  }
};
