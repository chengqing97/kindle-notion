import { Client } from "@notionhq/client";
import fs from "fs";
import parseClipping from "./parseClipping";
import { ParsedClippingObj, Options } from "./global";
import moment from "moment";
import inquirer from "inquirer";
import cliProgress from "cli-progress";
import { Ora } from "ora";
import chalk from "chalk";

interface Date {
  date: { start: string; end: string };
}

const confirmation = async (options: Options, numberOfClipping: Number) => {
  if (options.import_all) {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm_import_all",
        message: `Are you sure you want to import all ${numberOfClipping} clippings regardless of whether they have been imported previously?`,
        default: true,
      },
    ]);
    return answer.confirm_import_all;
  } else {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Confirm syncing ${numberOfClipping} clippings?`,
        default: true,
      },
    ]);
    return answer.confirm;
  }
};

export default async (options: Options, spinner: Ora) => {
  spinner.text = "Processing...";
  var fileContents = fs.readFileSync(options.clipping_path, "utf-8");
  let clippingJSON = parseClipping(fileContents);
  const notion = new Client({ auth: options.key });
  const lastClipping = await notion.databases.query({
    database_id: options.database_id,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 1,
  });
  const date = lastClipping.results?.[0]?.properties?.Date as Date;
  const lastClippingDate = date?.date.start;
  if (lastClippingDate && !options.import_all) {
    clippingJSON = clippingJSON.filter((obj) => moment(obj.date).isAfter(lastClippingDate, "minute"));
  }

  const numberOfClipping = clippingJSON.length;
  spinner.stop();
  if (numberOfClipping === 0)
    return console.log("Success! Your clipping is already in synced, no clipping is imported.");

  const confirmed = await confirmation(options, numberOfClipping);
  if (!confirmed) return console.log("Canceled");

  const bar = new cliProgress.SingleBar({
    format: `${options.import_all ? "Importing" : "Syncing"} [{bar}] {percentage}% | {value}/{total}`,
  });
  const submitOne = async (obj: ParsedClippingObj, index: Number) => {
    try {
      const response = await notion.pages.create(objectToSubmit(obj, options.database_id));
      bar.increment();
    } catch (error) {
      console.error(error.body);
      console.log(obj);
      //await submitOne(obj);
    }
  };
  const submitAll = async () => {
    bar.start(numberOfClipping, 0);
    await Promise.all(
      clippingJSON.map(async (obj, index) => {
        await submitOne(obj, index);
      })
    );
    bar.stop();
  };
  await submitAll();
  console.log(chalk.bold("Done!"));
};

const objectToSubmit = (obj: ParsedClippingObj, databaseId: string) => {
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
