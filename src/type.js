
'use strict';

var _ = require('js/_');


function Type(spec) {
    if (!_.is(Object, spec)) {
        throw new Error('expecting Object as spec');
    }
    if (_.isDefined(spec.update)) {
        throw new Error('"update" is reserved word for Type definition');
    }
    var o = {},
        keys = _.keys(spec);

    keys.forEach(function (key) {
        var fn = spec[key];
        if (spec[key].length > 2) {
            o[key] = _.curryN(fn.length - 1, function () { return {value: [].slice.apply(arguments), tag: key, handler: fn}; });
        } else {
            o[key] = function (smth) { return {value: smth, tag: key, handler: fn}; };
        }
    });
    function update(tagged, model) {
        var tag = tagged.tag,
            value = tagged.value,
            fn = tagged.handler;
        value = _.isArray(value) ? value
                                     : _.isDefined(value) ? [value]
                                                          : [];
        value.push(model);
        return fn.apply(null, value);
    }
    o.update = _.curryN(2, update);
    return o;
}


module.exports = Type;
