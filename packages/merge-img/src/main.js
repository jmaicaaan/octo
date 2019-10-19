import mergeImg from 'merge-img';
import { extname, join } from 'path';
import { readdirSync } from 'fs';
import * as r from 'ramda';
import program from 'commander';
import sharp from 'sharp';

import { version } from '../package.json';

const FILENAME_KEY = 'merged';
const DEFAULT_FILENAME = `${FILENAME_KEY}-${Date.now()}.png`;

export default async function main() {
  program
    .version(version)
    .option('-s, --source <source>', 'Directory source to locate files to merge')
    .option('-d, --destination [destination]', 'Directory destination on where to save the merged img')
    .option('-f, --filename [filename]', 'Name of the merged file', DEFAULT_FILENAME)
    .option('--includeAll [includeAll]', 'By default, we will only merge files that are not merged yet')
    .option('--compress [compress]', 'Compress the output images')
    .parse(process.argv);

  const {
    source,
    destination = source,
    filename,
    includeAll = false,
    compress = false,
  } = program;

  // Note that curried functions should not have optional values :)
  const paths = r.pipe(
    getImageFiles, 
    r.curry(includeMergedFiles)({ shouldIncludeMergedFiles: includeAll }), 
    r.curry(buildFilePaths)(source),
  )(source);

  const destinationPath = join(destination, filename);
  const mergedImagePath = await mergeImages(destinationPath, paths, { shouldCompress: compress });
  console.log('mergedImagePath', mergedImagePath);
}

function getImageFiles(directory) {
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
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

async function mergeImages(
  destinationPath, 
  imagePaths, 
  options = {
    shouldCompress,
  }
) {
  const { 
    shouldCompress = false,
  } = options;
  if (shouldCompress) {
    const mergedImg = await mergeImg(imagePaths);
    return sharp(mergedImg.bitmap.data).png().toFile(destinationPath);
  } else {
    const mergedImg = await mergeImg(imagePaths);
    return writeImage(mergedImg, destinationPath);
  }
}

function writeImage(mergeImgInstance, destinationPath) {
  return new Promise((resolve) => {
    mergeImgInstance.write(destinationPath, () => {
      resolve(destinationPath);
    });
  });
} 

function buildFilePaths(source, directoryFiles) {
  const files = directoryFiles || [];
  return files.map(file => join(source, file));
}

main();