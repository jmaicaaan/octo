import program from 'commander';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { version } from '../package.json';

export default function cli() {
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
      const executableFile = join('packages', name, executableFilePath);
      programInstance.command(commandName, commandDescription, { 
        executableFile
      });
    });
  }

  function getPackagesConfigurations() {
    const ROOT_DIR = process.cwd();
    const PACKAGES_DIR = join(ROOT_DIR, 'packages');

    const packageNames = readdirSync(PACKAGES_DIR);
    const packageMetadatas = packageNames.map(packageName => ({
      name: packageName,
      path: join(PACKAGES_DIR, packageName)
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
    const packageJSONPath = join(packageFullPath, 'package.json');
    const packageJSON = require(packageJSONPath);
    // Error: EISDIR: illegal operation on a directory, read
    //readFileSync(packageFullPath, 'utf8');
    return packageJSON;
  }
};

cli();