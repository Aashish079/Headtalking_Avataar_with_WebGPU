// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      filename: "[name].[contenthash].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    devServer: {
      static: {
        directory: path.join(__dirname, "public"),
      },
      hot: true,
      port: 3000,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|glb|gltf)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            to: "",
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
    ],
    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
  };
};
