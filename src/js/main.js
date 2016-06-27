
'use strict';

var app = require('js/app'),
    global = require('global'),
    doc = global.document;


function run(evt) {
    doc.removeEventListener('DOMContentLoaded', run);
    app(doc.getElementById('body'), doc.location);
}

if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
    run();
} else {
    doc.addEventListener('DOMContentLoaded', run);
}
