
'use strict';

var win = require('global'),
    doc = require('document'),
    _ = require('js/_');


module.exports = function (winEvents, docEvents) {
    var keys;
    if (_.isDefined(winEvents)) {
        keys = _.keys(winEvents);
        _.map(function (evtName) {
            win.addEventListener(evtName, winEvents[evtName], false);
        }, keys);
    }
    if (_.isDefined(docEvents)) {
        keys = _.keys(docEvents);
        _.map(function (evtName) {
            doc.addEventListener(evtName, docEvents[evtName], false);
        }, keys);
    }
};
