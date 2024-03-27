import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";

const getConfig = (env: { [key: string]: string }, argv: { [key: string]: string }): any => {
	const baseConfig = argv.mode === "production" ? productionConfig : debugConfig;
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
				},
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
		},
		output: {
			filename: "sales-report.js",
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
		minimizer: [new CssMinimizerPlugin()],
	},
};

export default getConfig;
