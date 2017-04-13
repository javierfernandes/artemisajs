import hook from 'css-modules-require-hook';
import sass from 'node-sass';

hook({
  extensions: ['.scss'],
  preprocessCss: data => sass.renderSync({ data }).css
});

// Prevent mocha from interpreting CSS @import files
const noop = () => null
require.extensions['.css'] = noop;
