#!/usr/bin/env node

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('commander'), require('fs'), require('path')) :
  typeof define === 'function' && define.amd ? define(['commander', 'fs', 'path'], factory) :
  (global = global || self, global.bundle = factory(global.program, global.fs, global.path));
}(this, function (program, fs, path) { 'use strict';

  program = program && program.hasOwnProperty('default') ? program['default'] : program;

  const version="1.0.0";

  function cli() {
    const instance = program
      .version(version);

    registerCommands(instance, getPackagesConfigurations());
    instance.parse(process.argv);

    function registerCommands(programInstance, packagesConfigurations) {
      if (!Array.isArray(packagesConfigurations)) {
        return;
      }
      packagesConfigurations.forEach(packageConfiguration => {
        const {
          name,
          configuration,
        } = packageConfiguration;
        const {
          commandName,
          commandDescription,
          executableFilePath,
        } = configuration;
        const executableFile = path.join('packages', name, executableFilePath);
        programInstance.command(commandName, commandDescription, { 
          executableFile
        });
      });
    }

    function getPackagesConfigurations() {
      const ROOT_DIR = process.cwd();
      const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

      const packageNames = fs.readdirSync(PACKAGES_DIR);
      const packageMetadatas = packageNames.map(packageName => ({
        name: packageName,
        path: path.join(PACKAGES_DIR, packageName)
      }));

      // Inspect all package json of each package and see if they have an "octo" object and has the option of "isExecutable"
      const verifiedPackages = packageMetadatas.filter(packageMetadata => {
        const {
          path,
        } = packageMetadata;
        const octoConfiguration = getPackageJSON(path).octo;
        const hasOctoConfiguration = !!octoConfiguration;
        const isExecutable = hasOctoConfiguration ? !!octoConfiguration.isExecutable : false;
        return hasOctoConfiguration && isExecutable;
      });
      
      const packagesConfigurations = verifiedPackages.map(verifiedPackage => ({
        path: verifiedPackage.path,
        name: verifiedPackage.name,
        configuration: getPackageJSON(verifiedPackage.path).octo,
      }));
      return packagesConfigurations;
    }

    function getPackageJSON(packageFullPath) {
      const packageJSONPath = path.join(packageFullPath, 'package.json');
      const packageJSON = require(packageJSONPath);
      // Error: EISDIR: illegal operation on a directory, read
      //readFileSync(packageFullPath, 'utf8');
      return packageJSON;
    }
  }
  cli();

  return cli;

}));
