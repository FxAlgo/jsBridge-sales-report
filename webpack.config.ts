import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import { NormalModuleReplacementPlugin } from "webpack";

const getConfig = (env: { [key: string]: string }, argv: { [key: string]: string }): any => {
	const isProduction = argv["mode"] === "production";
	const baseConfig = isProduction ? productionConfig : debugConfig;

	return {
		...baseConfig,
		context: path.resolve(__dirname, "src"),
		entry: "./sales-report.tsx",
		module: {
			rules: [
				{
					test: /\.(ts|tsx)?$/,
					use: "ts-loader",
					exclude: /node_modules/,
					//options: {
					//	webpackChunkName: "lazy-loaded-chunk",
					//},
				},
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
			],
		},
		performance: {
			hints: false,
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
		},
		output: {
			filename: "sales-report.js",
			//chunkFilename: "[name].js",
			path: path.resolve(__dirname, "dist"),
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: "JsBridge Sales Report",
				template: "./sales-report.tmpl.html",
				filename: "sales-report.html",
			}),
			new MiniCssExtractPlugin({
				filename: "./sales-report.css",
			}),
			new NormalModuleReplacementPlugin(/\.[\\/]getData/, resource => {
				//console.log("Replacing getData.ts", resource);
				if (!isProduction) {
					resource.request = resource.request.replace(/getData/, "demoData/getData");
				}
			}),
			//new DefinePlugin({
			//	__DEV: JSON.stringify(development),
			//}),
		],
	};
};

const debugConfig = {
	mode: "development",
	devtool: "source-map",
	devServer: {
		static: path.join(__dirname, "dist"),
		compress: true,
		port: 4000,
	},
};

const productionConfig = {
	mode: "production",
	optimization: {
		minimize: true,
		minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
	},
};

export default getConfig;
