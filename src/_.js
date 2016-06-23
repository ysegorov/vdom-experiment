
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

var slice = [].slice;

function isDefined(smth) {
    return smth !== undefined && smth !== null;
}

function debounce(fn, timeout) {
    var interval;
    return function debounced() {
        var args = slice.call(arguments);
        clearTimeout(interval);
        interval = setTimeout(function () {
            fn.apply(null, args);
        }, timeout);
    };
}

function throttle(fn, timeout) {
    var buff = [], interval;
    return function throttled() {
        buff.push(slice.call(arguments));
        if (interval) { return ; }
        interval = setInterval(function () {
            if (buff.length) {
                fn.apply(null, buff[buff.length - 1]);
                buff = [];
            } else {
                clearInterval(interval);
                interval = null;
            }
        }, timeout);
    };
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
    debounce: debounce,
    evolve: evolve,
    flip: flip,
    is: is,
    keys: keys,
    map: map,
    prop: prop,
    tap: tap,
    throttle: throttle
};
