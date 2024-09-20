import plugin from 'tailwindcss/plugin';

/* Adapted from: https://web.dev/speedy-css-tip-animated-gradient-text/ */
const waterReflectionPlugin = plugin(function ({ addUtilities, addBase }) {
	addUtilities({
		'.water-reflection-text': {
			'--bg-size': '300%',
			'--color-one': '#9ac2bf',
			'--color-two': '#406966',
			display: 'inline-block',
			position: 'relative',
			'background-image':
				'linear-gradient(90deg, var(--color-one), var(--color-two), var(--color-one))',
			'background-size': 'var(--bg-size) 100%',
			'background-repeat': 'repeat',
			'-webkit-background-clip': 'text',
			'background-clip': 'text',
			animation: 'move-bg 8s linear infinite',
			color: 'transparent',
			'& *': {
				'background-image': 'inherit',
				'background-clip': 'inherit',
				'-webkit-background-clip': 'inherit',
				'background-size': 'inherit',
				animation: 'inherit',
				color: 'transparent'
			}
		},
		'.water-reflection-underline': {
			'&::after': {
				content: '""',
				position: 'absolute',
				left: '0',
				right: '0',
				bottom: '0',
				height: '2px',
				'background-image':
					'linear-gradient(90deg, var(--color-one), var(--color-two), var(--color-one))',
				'background-size': 'var(--bg-size) 100%',
				animation: 'move-bg 8s linear infinite'
			}
		},
		'.water-reflection-border': {
			'--bg-size': '300%',
			'--color-one': '#9ac2bf',
			'--color-two': '#406966',
			'--border-width': '2px',
			position: 'relative',
			'z-index': '0',
			'&::before': {
				content: '""',
				position: 'absolute',
				top: 'calc(-1 * var(--border-width))',
				left: 'calc(-1 * var(--border-width))',
				right: 'calc(-1 * var(--border-width))',
				bottom: 'calc(-1 * var(--border-width))',
				background: 'linear-gradient(90deg, var(--color-one), var(--color-two), var(--color-one))',
				'background-size': 'var(--bg-size) 100%',
				'z-index': '-1',
				animation: 'move-bg 8s linear infinite',
				'border-radius': 'inherit'
			},
			'&::after': {
				content: '""',
				position: 'absolute',
				top: '0',
				left: '0',
				right: '0',
				bottom: '0',
				background: 'inherit',
				'z-index': '-1',
				'border-radius': 'inherit'
			}
		}
	});

	addBase({
		'@keyframes move-bg': {
			to: {
				'background-position': 'var(--bg-size) 0'
			}
		}
	});

	addBase({
		'@media (prefers-reduced-motion: reduce)': {
			'.water-reflection-text, .water-reflection-underline:after, .water-reflection-border::before':
				{
					animation: 'none'
				}
		}
	});
});

export default waterReflectionPlugin;
