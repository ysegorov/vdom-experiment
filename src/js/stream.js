
'use strict';

var _ = require('js/_');


function stream(initial) {

    function setValue(v, s) {
        if (v && typeof v === 'object' && typeof v.then === 'function') {
            v.then(s);
            return ;
        }
        s.val = v;
        s.listeners.forEach(function inner(fn) { fn(v); });
        return v;
    }
    function getValue(s) {
        return s.val;
    }
    function addListener(fn, s) {
        s.listeners.push(fn);
    }

    function s(v) {
        return arguments.length > 0 ? setValue(v, s) : getValue(s);
    }
    s.val = initial || null;
    s.listeners = [];

    s.map = (function (s) {
        return function (fn) {
            var ns = stream();
            addListener(_.compose(ns, fn), s);
            return ns;
        };
    })(s);
    s.scan = (function (s) {
        return function(fn, acc) {
            var ns = stream(acc);
            addListener(function (v) {
                acc = fn(acc, v);
                ns(acc);
            }, s);
            return ns;
        };
    })(s);

    return s;
}

module.exports = stream;
