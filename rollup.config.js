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
					// css modules for less class names
					const components = filename.match(/src\/components\/(\w+)(?:\/\w+)*\/styles.less$/);
					const base = filename.match(/src\/(\w+)(?:\/\w+)*\/styles.less$/);
					if (components) {
						return `webSDK-${components[1]}-${name}`;
					} else if (base) {
						return `webSDK-${base[1]}-${name}`;
					}
					return `webSDK-${name}`;
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