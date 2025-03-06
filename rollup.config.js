// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/index.js', format: 'cjs' },
    { file: 'dist/index.es.js', format: 'es' }
  ],
  plugins: [
    resolve({
      extensions: ['.js', '.jsx'] // Resolve .jsx files
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**', // Don’t transpile node_modules
      extensions: ['.js', '.jsx'] // Process .jsx files
    }),
    postcss()
  ],
  external: ['react', 'react-dom']
};