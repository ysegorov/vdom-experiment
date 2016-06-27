
'use strict';

var notifier = new require('node-notifier'),
    dateformat = require('dateformat'),
    color = require('cli-color'),
    info = color.green,
    warn = color.yellow,
    err = color.red,
    minLength = 13;


/**
 * Logger
 **/
function log(name, msg, level) {

    level = level || 'info';

    var isErr = level === 'err',
        isWarn = level === 'warn',
        isInfo = level === 'info',
        prefix = isErr ? err(' [E] ') : (isWarn ? warn(' [W] ') : info(' [I] ')),
        dt = dateformat('yyyy-mm-dd HH:MM:ss'),
        txt;

    if (!msg) {
        console.log();
    } else {
        txt = '[ ' + name + ' ' + dt +' ]' + prefix + msg;
        console.log(txt);
    }
    if (isErr) {
        notifier.notify({title: 'Error in watcher!', message: msg, urgency: 'normal'});
    }
}

module.exports = function getLogger(name, xTermColor) {
    var nm = color.xterm(xTermColor);

    if (name.length < minLength) {
        name += ' '.repeat(minLength - name.length);
    }
    nm = nm(name);

    return function logger(msg, level) {
        log(nm, msg, level);
    };
};
