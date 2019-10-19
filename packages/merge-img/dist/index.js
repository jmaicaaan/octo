(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('merge-img'), require('path'), require('fs'), require('ramda'), require('commander'), require('sharp')) :
  typeof define === 'function' && define.amd ? define(['merge-img', 'path', 'fs', 'ramda', 'commander', 'sharp'], factory) :
  (global = global || self, global.bundle = factory(global.mergeImg, global.path, global.fs, global.r, global.program, global.sharp));
}(this, function (mergeImg, path, fs, r, program, sharp) { 'use strict';

  mergeImg = mergeImg && mergeImg.hasOwnProperty('default') ? mergeImg['default'] : mergeImg;
  program = program && program.hasOwnProperty('default') ? program['default'] : program;
  sharp = sharp && sharp.hasOwnProperty('default') ? sharp['default'] : sharp;

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

    const destinationPath = path.join(destination, filename);
    const mergedImagePath = await mergeImages(destinationPath, paths, { shouldCompress: compress });
    console.log('mergedImagePath', mergedImagePath);
  }

  function getImageFiles(directory) {
    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    const files = fs.readdirSync(directory);
    const imageFiles = files.filter(file => imageExtensions.includes(path.extname(file)));
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
        console.log('destinationPath', destinationPath);
        resolve(destinationPath);
      });
    });
  } 

  function buildFilePaths(source, directoryFiles) {
    const files = directoryFiles || [];
    return files.map(file => path.join(source, file));
  }

  main();

  return main;

}));
