
'use strict';

var h = require('snabbdom/h'),
    _ = require('js/_'),
    icons = require('js/svg'),
    urls = require('js/urls');


function span(text) { return h('span.text', {}, text); }

function navItem(spec, current) {
    var itemClass = 'nav-item',
        linkClass = 'nav-link',
        children = [];

    if (spec.icon !== null) {
        children.push(spec.icon);
    }
    if (spec.text) {
        children.push(span(spec.text));
    }

    return h('li.' + itemClass, {class: {selected: urls.isSelected(spec, current)}}, [
            h('a.js-nav.' + linkClass,
              {props: {href: spec.href, title: spec.title}},
              children
            )
    ]);
}


function header(action) {
    return h('div.main-header', {}, [
    ]);
}

function footer(urls) {
    var children = urls.map(function (spec) { return navItem(spec); });

    return h('div.main-footer', {}, [
        h('ul.footer-nav', {}, children),
        h('span.footer-copyright', {}, 'Copyright (c) ' + (new Date()).getFullYear())
    ]);
}

function mainNav(urls, currentLocation) {
    var children = urls.map(function (spec) {
            return navItem(spec, currentLocation);
        });
    return h('ul.main-nav', {}, children);
}

function view(urls, action, model) {
    return h('div.layout', {}, [
        // header(action),
        h('div.main-body', {}, [
            h('div.main-left-col', {}, [
                h('div.logo', {}, [icons.logo]),
                h('div.divider', {}, ' '),
                mainNav(urls.main, model.location),
                footer(urls.footer)
            ]),
            h('div.main-content', {}, 'Main content')
        ]),
    ]);
}

module.exports = {view: _.curryN(3, view)(urls)};
