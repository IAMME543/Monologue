module.exports = {
	globDirectory: '/home/mason/Projects/Monologue',
	globPatterns: [
		'**/*.{jsonc,json,md}'
	],
	swDest: '/home/mason/Projects/Monologue/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};