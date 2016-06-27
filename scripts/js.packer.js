
'use strict';

var path = require('path'),
    webpack = require('webpack'),
    xTermColor = 113,
    config = require('../webpack.config'),
    log = require('./logger')('js', xTermColor),
    compiler;


compiler = webpack(config);


compiler.run(function (err, stats) {
    if (stats.hasErrors()) {
        log('  .. js build failed', 'err');
    } else {
        log('  .. js bundle(s) (re)generated');
    }
    log('');
    console.log(stats.toString({colors: true, chunks: false}));
    log('');
});
