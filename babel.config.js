module.exports = {
	presets: [
		// [
		// 	'@babel/preset-env',
		// 	{
		// 		targets: {
		// 			node: true
		// 		}
		// 	}
		// ],
		'@babel/preset-typescript'
	],
	plugins: [
		// 	[
		// 		'@babel/plugin-proposal-decorators',
		// 		{
		// 			legacy: true
		// 		}
		// 	],
		// 	'@babel/plugin-proposal-class-properties',
		'const-enum'
	]
};
