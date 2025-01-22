import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import svelteParser from 'svelte-eslint-parser';
import sveltePlugin from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';

const ignores = [
	'.DS_Store',
	'node_modules',
	'build/',
	'.svelte-kit/',
	'.env',
	'.env.*',
	'!.env.example',
	'pnpm-lock.yaml',
	'package-lock.json',
	'yarn.lock'
];

export default [
	{
		ignores
	},
	{
		files: ['**/*.{js,ts,svelte}'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2017,
				...globals.node,
				$$Generic: 'readonly'
			},
			parser: tsParser,
			parserOptions: {
				extraFileExtensions: ['.svelte']
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			svelte: sveltePlugin
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_|\\$\\$Props|\\$\\$Events',
					varsIgnorePattern: '^_|\\$\\$Props|\\$\\$Events',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'svelte/no-at-html-tags': 'warn',
			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			}
		}
	},
	prettierConfig
];
