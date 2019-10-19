import shebang from 'rollup-plugin-add-shebang';
import baseConfig from '../../config/rollup.config';

export default {
  ...baseConfig,
  input: 'src/cli.js',
  output: {
    ...baseConfig.output,
    file: 'dist/cli.js'
  },
  plugins: [
    ...baseConfig.plugins,
    shebang({
      include: 'dist/cli.js'
    })
  ]
}