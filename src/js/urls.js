
'use strict';

var _ = require('js/_'),
    icons = require('js/svg');


function url(href, icon, title, text) {
    return {
        href: href,
        icon: icon !== null ? icons[icon] : icon,
        title: title,
        text: text
    };
}

module.exports = {
    'main': [
        url('/', 'home', 'Home', 'Home'),
        url('/icons', 'icons', 'Icons', 'Icons'),
        url('/sandbox', 'sandbox', 'Sandbox', 'Sandbox'),
        url('/settings', 'settings', 'Settings', 'Settings')
    ],
    'footer': [
        url('/about', null, 'About', 'About'),
        url('/credits', null, 'Credits', 'Credits')
    ],
    isSelected: function (spec, loc) {
        return _.isDefined(loc) && (spec.href === '/' ? loc.pathname === '/' : loc.pathname.startsWith(spec.href));
    }
};
