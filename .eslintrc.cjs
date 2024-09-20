module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
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
	},
	globals: {
		$$Generic: 'readonly'
	}
};
