import program from 'commander';
import { readdirSync } from 'fs';
import { join } from 'path';

import { version } from '../package.json';

export default function cli() {
  // Should we do it through env variable process.env.OCTO_ROOT_DIR?
  const ROOT_DIR = join(__dirname, '/../../../');
  const PACKAGES_DIR = join(ROOT_DIR, 'packages');

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
      const executableFile = join(PACKAGES_DIR, name, executableFilePath);
      programInstance.command(commandName, commandDescription, { 
        executableFile
      });
    });
  }

  function getPackagesConfigurations() {
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
