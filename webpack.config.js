const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackMessages = require('webpack-messages');
const ExcludeAssetsPlugin = require('webpack-exclude-assets-plugin');

const isProduction = process.env.NODE_ENV === 'production' ? true : false;
const rootPath = path.resolve(__dirname);
const distPath = rootPath + '/dist';
const assetDistPath = distPath;
const srcPath = rootPath + '/src';
const appName = 'mini-portfolio';

function getEntryFiles() {
    const entries = {
        // css/js
        'css/style.bundle': srcPath + '/scss/style.scss',
    };

    // Custom 3rd party plugins
    (glob.sync('./src/js/custom/**/*.+(js)') || []).forEach(file => {
        let loc = file.replace('./', '')
        loc = loc.replace('.js', '.bundle')
        entries[loc] = file
    });

    // Custom pages styles scss: /src/pages/
    (glob.sync('./src/scss/pages/!(_)*.scss') || []).forEach(file => {
        entries[file.replace(/.*scss\/(.*?)\.scss$/ig, 'css/$1')] = file.replace(/.*scss\/(.*?)$/ig, './src/scss/$1')
    });

    // All files js: /src/js/
    (glob.sync('./src/js/**/!(_)*.js') || []).forEach(file => {
        entries[file.replace(/.*js\/(.*?)\.js$/ig, 'js/$1')] = file.replace(/.*js\/(.*?)$/ig, './src/js/$1')
    });

    return entries;
}

function mainConfig() {
    return {
        // enabled/disable optimizations
        mode: isProduction ? 'production' : 'development',
        // console logs output, https://webpack.js.org/configuration/stats/
        stats: 'errors-warnings',
        performance: {
            // disable warnings hint
            hints: false,
        },
        optimization: {
            // js and css minimizer
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        },
        entry: getEntryFiles(),
        output: {
            // main output path in assets folder
            path: assetDistPath,
            // output path based on the entries' filename
            filename: '[name].js',
        },
        devtool: 'source-map',
        plugins: [
            new WebpackMessages({
                name: appName,
                logger: str => console.log(`>> ${str}`),
            }),
            // create css file
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new CopyWebpackPlugin([
                {
                    // copy media
                    from: srcPath + '/media',
                    to: assetDistPath + '/media',
                },
            ]),
            new CopyWebpackPlugin([
                {
                    // copy plugins
                    from: srcPath + '/plugins',
                    to: assetDistPath + '/plugins',
                },
            ]),
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: (url, resourcePath) => {
                                    // Don't handle local urls
                                    return !!url.includes('media');
                                },
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                    include: [
                        path.resolve(__dirname, 'node_modules'),
                        rootPath,
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                // emitFile: false,
                                // prevent name become hash
                                name: '[name].[ext]',
                                // move files
                                outputPath: 'media/fonts',
                                // rewrite path in css
                                publicPath: '../media/fonts',
                            },
                        },
                    ],
                },
                {
                    test: /\.(gif|png|jpe?g)$/,
                    include: [
                        path.resolve(__dirname, 'node_modules'),
                        rootPath,
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                // emitFile: false,
                                name: '[path][name].[ext]',
                                // move files
                                outputPath(url, resourcePath, context) {
                                    return url.replace(/.*src\/(.*?)$/ig, '$1')
                                },
                                // rewrite path in css
                                publicPath(url, resourcePath, context) {
                                    return url.replace(/.*src\/(.*?)$/ig, '../$1')
                                },
                            },
                        },
                    ],
                },
            ],
        },
        // webpack dev server config
        devServer: {
            contentBase: distPath,
            compress: true,
            port: 3000,
        },
    };
}

module.exports = () => {
    return [mainConfig()];
}