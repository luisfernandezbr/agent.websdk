import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
	input: 'src/index.ts',
	output: [
		{
			file: pkg.main,
			format: 'cjs',
			exports: 'named',
			sourcemap: true
		},
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
	],
	plugins: [
		postcss({
			modules: {
				generateScopedName: (name, filename) => {
					const less = filename.match(/src\/(\w+)(?:\/\w+)*\/styles.less$/);
					if (less) {
						return `agent-websdk-${less[1]}-${name}`; // css modules for less class names, e.g. ui-FilterSimple-Dropdown
					}
					return name;
				}
			}
		}),
		typescript({
			rollupCommonJSResolveHack: true,
			clean: true,
			typescript: require('typescript'),
		}),
		commonjs(),
	],
};