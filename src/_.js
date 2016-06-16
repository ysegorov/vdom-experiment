
'use strict';

var adjust = require('ramda/src/adjust'),
    append = require('ramda/src/append'),
    assoc = require('ramda/src/assoc'),
    compose = require('ramda/src/compose'),
    curry = require('ramda/src/curry'),
    curryN = require('ramda/src/curryN'),
    evolve = require('ramda/src/evolve'),
    flip = require('ramda/src/flip'),
    is = require('ramda/src/is'),
    keys = require('ramda/src/keys'),
    map = require('ramda/src/map'),
    prop = require('ramda/src/prop'),
    tap = require('ramda/src/tap');


function isDefined(smth) {
    /* jshint eqnull:true */
    return smth != null;
}


module.exports = {
    isArray: Array.isArray,
    isDefined: isDefined,
    adjust: adjust,
    append: append,
    assoc: assoc,
    compose: compose,
    curry: curry,
    curryN: curryN,
    evolve: evolve,
    flip: flip,
    is: is,
    keys: keys,
    map: map,
    prop: prop,
    tap: tap
};
