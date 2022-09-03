const CopyFilePlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.min.js'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                ecma: 6,
                compress: true,
                output: {
                    comments: false,
                    beautify: false
                }
            }
        })]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'JS13kgames2022d',
            template: './index.html',
            filename: 'index.html',
        }),
        new CopyFilePlugin({
            patterns: [
                {
                    context: "assets",
                    from: "**/*.*",
                    to: __dirname + "/dist/assets"
                }
            ],
        }),
        new WriteFilePlugin()
    ],
};