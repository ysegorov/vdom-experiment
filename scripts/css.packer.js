
'use strict';

var path = require('path'),
    fs = require('fs'),
    postcss = require('postcss'),
    // cssgrace = require('cssgrace'),
    csswring = require('csswring'),
    atImport = require('postcss-import'),
    autoprefixer = require('autoprefixer'),
    colorFunction = require('postcss-color-function'),
    comments = require('postcss-discard-comments'),
    vars = require('postcss-simple-vars'),
    xTermColor = 201,
    log = require('./logger')('css', xTermColor),
    debug = process.env.DEBUG === 'y',
    srcDir = path.resolve(path.join(__dirname, '..', 'src', 'css')),
    dstDir = path.resolve(path.join(__dirname, '..', 'dist', 'css')),
    dst = path.join(dstDir, 'style.css'),
    dstMap = path.join(dstDir, 'style.css.map'),
    src = path.join(srcDir, 'style.css'),
    plugins,
    processor;

plugins = [
    atImport({path: srcDir}),
    vars(),
    colorFunction(),
    autoprefixer({browsers: ['last 5 versions']})];

if (!debug) {
    plugins.push(csswring.postcss);
} else {
    plugins.push(comments());
}

processor = postcss(plugins);


var css = fs.readFileSync(src, {encoding: 'utf8'});

processor.process(css, {from: src, to: dst})
    .then(function (result) {
        fs.writeFileSync(dst, result.css);

        if (result.map) {
            fs.writeFileSync(dstMap, result.map);
        }

        log('  .. style.css (re)generated');

    }).catch(function (err) {
        console.log(err.stack);
        log(err.message, 'err');
        log('  .. css styles failed', 'err');
    });
