const webpack = require("webpack");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "static");
const SRC_DIR  = path.resolve(__dirname, "src");

const config = {
    entry: {
        main: SRC_DIR + "/main/index.jsx"
    },

    output: {
        path: BUILD_DIR + "/",
        filename: '[name].bundle.js'
    },

    devServer: {
        static: {
            directory: BUILD_DIR
        },
        compress: true,
        port: 9000,
    },

    mode: "development",

    module: {
        rules: [
            {
                test: /\.jsx?/,
                include: SRC_DIR,
                loader: "babel-loader",
                options: {
                    presets: [
                        '@babel/env',
                        '@babel/react'
                    ]
                },
                resolve: {
                    extensions: ['.js', '.jsx']
                }
            },
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" }
                ]
            },

            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader',
                exclude: /node_modules/,
                options: {
                    name: '/resources/images/[name].[ext]'
                }
            }
        ],
    }
};

module.exports = config;