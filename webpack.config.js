import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import dotenv from "dotenv";
import CopyWebpackPlugin from "copy-webpack-plugin";

// Определяем __dirname для ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем правильный .env файл в зависимости от режима
const envFile =
  process.env.MODE === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

export default {
  mode: process.env.MODE || "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.json$/,
        type: "javascript/auto",
        use: ["json-loader"], // Для загрузки JSON-файлов
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL),
      "process.env.MONGO_URI": JSON.stringify(process.env.MONGO_URI),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/translations", to: "translations" }, // Копируем файлы переводов
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 8080,
    historyApiFallback: true,
    open: true,
  },
};
