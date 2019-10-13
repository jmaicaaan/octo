import mergeImg from 'merge-img';
import { join, extname } from 'path';
import { readdirSync } from 'fs';
import { pipe, curry } from 'ramda';
import program from 'commander';

const version="1.0.0";

const FILENAME_KEY = 'merged';
const DEFAULT_FILENAME = `${FILENAME_KEY}-${Date.now()}.png`;

async function main() {
  program
    .version(version)
    .option('-s, --source <source>', 'Directory source to locate files to merge')
    .option('-d, --destination [destination]', 'Directory destination on where to save the merged img')
    .option('-f, --filename [filename]', 'Name of the merged file', DEFAULT_FILENAME)
    .option('--includeAll [includeAll]', 'By default, we will only merge files that are not merged yet')
    .parse(process.argv);

  const {
    source,
    destination = source,
    filename,
    includeAll = false,
  } = program;

  // Note that curried functions should not have optional values :)
  const paths = pipe(
    getImageFiles, 
    curry(includeMergedFiles)({ shouldIncludeMergedFiles: includeAll }), 
    curry(buildFilePaths)(source),
  )(source);

  const mergedImg = await mergeImg(paths);
  const destinationPath = join(destination, filename);
  
  mergedImg.write(destinationPath, () => {
    console.log('destinationPath', destinationPath);
  });
}

function getImageFiles(directory) {
  const imageExtensions = ['.png', '.jpg'];
  const files = readdirSync(directory);
  const imageFiles = files.filter(file => imageExtensions.includes(extname(file)));
  return imageFiles;
}

function includeMergedFiles(options, files) {
  const {
    shouldIncludeMergedFiles = false,
  } = options;

  if (shouldIncludeMergedFiles) {
    return files;
  }
  // Get files that doesn't have ${FILENAME_KEY} 
  return Array.isArray(files) && files.filter(file => !file.includes(FILENAME_KEY));
}

function buildFilePaths(source, directoryFiles) {
  const files = directoryFiles || [];
  return files.map(file => join(source, file));
}

main();

export default main;
