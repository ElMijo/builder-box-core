require("dotenv").config();
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    target: 'node',
    node: {
        __filename: false,
        __dirname: false
    },
    externals: [nodeExternals()],
    entry: "./src/index.ts",
    mode: "production",
    devtool: 'source-map',
    output: {
        filename: 'builderbox-core.js',
        path: path.resolve(__dirname, './lib'),
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],

    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.SourceMapDevToolPlugin({
            filename: null,
            exclude: [/node_modules/],
            test: /\.ts($|\?)/i
        }),
        new ForkTsCheckerWebpackPlugin({
            eslint: {
              files: './src/**/*.{ts,js}'
            }
        })
    ]
};
