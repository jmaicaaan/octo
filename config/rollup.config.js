import json from 'rollup-plugin-json';
import shebang from 'rollup-plugin-add-shebang';

// Note: To extend this base config, create a `rollup.config.js` on your package
// then `require` this and set your rollup config location to your new config file.

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/index.js',
    // https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm
    format: 'umd',
    name: 'bundle'
  },

  plugins: [
    json({
      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  ',

      // ignores indent and generates the smallest code
      compact: true, // Default: false

      // generate a named export for every property of the JSON object
      namedExports: true // Default: true
    }),
    shebang({
      include: 'dist/index.js'
    })
  ]
};