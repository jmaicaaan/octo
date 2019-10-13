// import * as r from 'ramda';
import program from 'commander';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { format } from 'date-fns';
import { join } from 'path';
import { exec } from 'child_process';
import { prompt } from 'inquirer';

import { version } from '../package.json';

export default async function main() {
  program
    .version(version)
    .option('-c, --create', 'Create a new diary with a format of MM-dd-yy')
    .option('-o, --open <filter>', 'Open a diary based from the given date (format: today | MM-dd-yy)')
    .option('-l, --list', 'Show all diary')

  // Should we do https://github.com/tj/commander.js/#custom-event-listeners ?
  // If we use the custom-event-listeners, we will need to put below the `program.parse`
  // See https://github.com/tj/commander.js/#custom-help

  registerOptionListener('list', async () => {
    await listAll();
  });
  registerOptionListener('create', () => {
    const diaryName = format(new Date(), 'MM-dd-yy');
    createDiary(diaryName);
  });
  registerOptionListener('open', (data) => {
    const diaryName = data === 'today' 
      ? format(new Date(), 'MM-dd-yy')
      : format(new Date(read), 'MM-dd-yy');
    openDiary(diaryName);
  });

  program.parse(process.argv);

  function createDiary(filename) {
    const path = buildFilePath(filename);
    writeFileSync(path, '');
  }

  async function listAll() {
    const path = buildFilePath('');
    const diaries = readdirSync(path);
    const { 
      diary
    } = await prompt([{
      type: 'list',
      name: 'diary',
      message: 'Which one do you want to open up?',
      choices: diaries
    }]);
    openDiary(diary);
  }

  function openDiary(filename) {
    const path = buildFilePath(filename);
    if (existsSync(path)) {
      exec(`code ${path}`);
    }
  }

  function buildFilePath(filename) {
    const path = '/Users/jsantos/Desktop/daily-notes';
    return join(path, filename);
  }

  function registerOptionListener(optionName, handler) {
    program.on(`option:${optionName}`, function (args) {
      if (this[optionName]) {
        handler(this[optionName]);
      }
    });
  }
}

main();