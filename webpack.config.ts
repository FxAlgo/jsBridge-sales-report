import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const getConfig = (
	env: { [key: string]: string },
	argv: { [key: string]: string }
): any => {
	return {
		context: __dirname,
		entry: path.resolve(__dirname, './src/index.tsx'),
		module: {
			rules: [
				{
					test: /\.(ts|tsx)?$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, "css-loader"]
				}
			],
		},
		mode: argv.mode === "production" ? "production" : "development",
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
		output: {
			filename: 'index.js',
			path: path.resolve(__dirname, 'dist'),
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'JsBridge plugin',
				template: 'src/index.html'
			}),
			new MiniCssExtractPlugin({
				filename: "styles.css"
			})
		],
		optimization: {
			minimizer: [
				new CssMinimizerPlugin()
			],
		},
		devServer: {
			static: path.join(__dirname, "dist"),
			compress: true,
			port: 4000
		},
	};
}

export default getConfig;
