(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('commander'), require('fs'), require('date-fns'), require('path'), require('child_process'), require('inquirer')) :
  typeof define === 'function' && define.amd ? define(['commander', 'fs', 'date-fns', 'path', 'child_process', 'inquirer'], factory) :
  (global = global || self, global.bundle = factory(global.program, global.fs, global.dateFns, global.path, global.child_process, global.inquirer));
}(this, function (program, fs, dateFns, path, child_process, inquirer) { 'use strict';

  program = program && program.hasOwnProperty('default') ? program['default'] : program;

  const version="1.0.0";

  // import * as r from 'ramda';

  async function main() {
    program
      .version(version)
      .option('-c, --create', 'Create a new diary with a format of MM-dd-yy')
      .option('-o, --open <filter>', 'Open a diary based from the given date (format: today | MM-dd-yy)')
      .option('-l, --list', 'Show all diary');

    // Should we do https://github.com/tj/commander.js/#custom-event-listeners ?
    // If we use the custom-event-listeners, we will need to put below the `program.parse`
    // See https://github.com/tj/commander.js/#custom-help

    registerOptionListener('list', async () => {
      await listAll();
    });
    registerOptionListener('create', () => {
      const diaryName = dateFns.format(new Date(), 'MM-dd-yy');
      createDiary(diaryName);
    });
    registerOptionListener('open', (data) => {
      const diaryName = data === 'today' 
        ? dateFns.format(new Date(), 'MM-dd-yy')
        : dateFns.format(new Date(read), 'MM-dd-yy');
      openDiary(diaryName);
    });

    program.parse(process.argv);

    function createDiary(filename) {
      const path = buildFilePath(filename);
      fs.writeFileSync(path, '');
    }

    async function listAll() {
      const path = buildFilePath('');
      const diaries = fs.readdirSync(path);
      const { 
        diary
      } = await inquirer.prompt([{
        type: 'list',
        name: 'diary',
        message: 'Which one do you want to open up?',
        choices: diaries
      }]);
      openDiary(diary);
    }

    function openDiary(filename) {
      const path = buildFilePath(filename);
      if (fs.existsSync(path)) {
        child_process.exec(`code ${path}`);
      }
    }

    function buildFilePath(filename) {
      const path$1 = '/Users/jsantos/Desktop/daily-notes';
      return path.join(path$1, filename);
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

  return main;

}));
