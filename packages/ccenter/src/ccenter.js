import program from 'commander';

import mergeImg from '@octo/merge-img';

export default function main() {
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
