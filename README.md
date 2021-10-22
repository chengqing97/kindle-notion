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
Follow Step 1 and Step 2 in this [guide](https://developers.notion.com/docs/getting-started) and note down your "Internal Integration Token" and database id.
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
kindle-notion [Flag]
```

| Flag | Description |
| ----------- | ----------- |
| -h --help | Show help. |
| -a --all | Import all clippings regardless whether they have been previously imported. |

### 
