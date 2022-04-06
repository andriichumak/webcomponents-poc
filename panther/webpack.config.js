// (C) 2007-2021 GoodData Corporation
const {DefinePlugin, EnvironmentPlugin, ProvidePlugin} = require("webpack");
const path = require("path");

module.exports = {
	mode: "development",// "production",
	target: "web",
	devtool: false,
	experiments: {
		outputModule: true,
	},
	output: {
		library: {
			type: 'module'
		},
	},
	entry: "./src/index",
	name: "main",
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		port: 8080,
		host: "127.0.0.1",
		https: true,
	},
	resolve: {
		// Allow omitting extensions when requiring these files
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],

		alias: {
			// fixes tilde imports in CSS from sdk-ui-* packages
			"@gooddata/sdk-ui-dashboard": path.resolve("./node_modules/@gooddata/sdk-ui-dashboard"),
			"@gooddata/sdk-ui-ext": path.resolve("./node_modules/@gooddata/sdk-ui-ext"),
		},

		// Prefer ESM versions of packages to enable tree shaking
		mainFields: ["module", "browser", "main"],

		// polyfill "process" and "util" for lru-cache, webpack 5 no longer does that automatically
		// remove this after IE11 support is dropped and lru-cache can be finally upgraded
		fallback: {
			process: require.resolve("process/browser"),
			util: require.resolve("util/"),
		},
	},
	module: {
		rules: [
			// TS source files in case TS is used
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: "babel-loader",
					},
					{
						loader: "ts-loader",
						options: {
							transpileOnly: true,
						},
					},
				],
			},
			// JS source files in case JS is used
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-react"],
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(eot|woff|ttf|svg|jpg|jpeg|gif)/,
				type: "asset/resource",
			},
			{
				test: /\.js$/,
				enforce: "pre",
				include: path.resolve(__dirname, "src"),
				use: ["source-map-loader"],
			},
		],
		parser: {
			javascript: {
				importMeta: false,
			},
		},
	},
	plugins: [
		new EnvironmentPlugin({
			npm_package_name: "",
			npm_lifecycle_script: "",
			_nodeLRUCacheForceNoSymbol: "",
			TEST_PSEUDOMAP: "",
			NODE_DEBUG: "",
		}),
		new ProvidePlugin({
			process: "process/browser",
		}),
		new DefinePlugin({
			PORT: JSON.stringify(8080),
		}),
	],
};

