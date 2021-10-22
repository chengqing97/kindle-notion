# Kindle-Notion
Kindle-Notion is a command line tool to sync your Kindle Clippings to your Notion database.

## Installation
> Currently only work on Linux

You will need to install [nodejs](https://nodejs.org) first.
```
git clone https://github.com/chengqing97/kindle-notion.git
cd kindle-notion
npm install
sudo npm link
```

## Notion Configuration
Follow Step 1 and Step 2 in this <a href="https://developers.notion.com/docs/getting-started" target="_blank">guide</a> and note down your "Internal Integration Token" and database id.
Your database should have columns exactly named and typed as follow:
| Column Name | Property Type |
| ----------- | ----------- |
| Content | Title |
| Book | Select |
| Author | Text |
| Page | Text |
| Location | Text |
| Date | Date |


## Usage
```
kindle-notion
```
![kindle-notion demo](https://user-images.githubusercontent.com/73209378/138439737-9f7a5b18-5b78-4103-bf5f-3494d6012348.png)

