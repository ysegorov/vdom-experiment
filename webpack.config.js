/* global __dirname */

var debug = process.env.DEBUG === 'y';

var path = require('path');

var webpack = require('webpack');

var dirJs = path.resolve(__dirname, 'src');
var dirBuild = path.resolve(__dirname, 'dist', 'js');

var info = require('./package.json'),
    title = info.name,
    author = info.author,
    version = info.version,
    build = Date.now();

var plugins = [
    new webpack.BannerPlugin(title + '\n' + author + '\n' + version + ':' + build),
    new webpack.optimize.DedupePlugin(),
    new webpack.NoErrorsPlugin()
];


module.exports = {
    entry: path.resolve(dirJs, 'main.js'),
    target: 'web',
    cache: !debug,
    debug: !debug,
    output: {
        path: dirBuild,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: dirBuild,
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            include: /src/,
            exclude: /node_modules/,
            loader: 'jshint'
        }],
        loaders: []
    },
    plugins: plugins,
    stats: {
        colors: true,
        timings: true,
        reasons: true
    },
    externals: {
        global: 'window'
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        alias: {
            js: __dirname + '/src'
        }
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
