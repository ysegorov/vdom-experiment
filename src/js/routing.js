
'use strict';

var _ = require('js/_'),
    history = require('global').history;


function preventDefault(evt) {
    if (evt && typeof evt.preventDefault === 'function') {
        evt.preventDefault();
    }
}
function pushState(loc) {
    history.pushState(loc, '', loc.href);
}
function hrefToLocation(evt) {
    var link = evt.currentTarget || evt;

    return {
        protocol: link.protocol,
        host: link.host,
        port: link.port,
        hostname: link.hostname,
        pathname: link.pathname,
        search: link.search,
        hash: link.hash,
        href: link.href
    };
}


module.exports = _.compose(_.tap(pushState), hrefToLocation, _.tap(preventDefault));
