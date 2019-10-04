(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('commander'), require('@octo/merge-img')) :
  typeof define === 'function' && define.amd ? define(['commander', '@octo/merge-img'], factory) :
  (global = global || self, global.main = factory(global.program, global.mergeImg));
}(this, function (program, mergeImg) { 'use strict';

  program = program && program.hasOwnProperty('default') ? program['default'] : program;
  mergeImg = mergeImg && mergeImg.hasOwnProperty('default') ? mergeImg['default'] : mergeImg;

  function main() {
    program
      .command('merge-img')
      .alias('r')
      .description('Merge Images')
      .action(name => {
        console.log('1', 1);
        mergeImg();
      });

    program.parse(process.argv);
  }
  main();

  return main;

}));
