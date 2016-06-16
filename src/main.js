
'use strict';

var app = require('js/app'),
    doc = require('document'),
    win= require('global');


function run(evt) {
    app(doc.getElementById('body'));
}

if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
    run();
} else {
    doc.addEventListener('DOMContentLoaded', run);
}
