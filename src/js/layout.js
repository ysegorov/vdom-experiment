
'use strict';

var h = require('snabbdom/h');
var icons = require('js/svg');


function span(text) { return h('span.text', {}, text); }

function navItem(prefix, props, children) {
    var itemCl = prefix + '-item';
    var linkCl = prefix + '-link';
    return h('li.' + itemCl, {}, [h('a.' + linkCl, {props: props}, children || [])]);
}

function header(action) {
    return h('div.main-header', {}, [
    ]);
}

function footer(action) {

    return h('div.main-footer', {}, [
        h('ul.footer-nav', {}, [
            navItem('footer-nav', {href: '#about', title: 'About'}, [span('About')]),
            navItem('footer-nav', {href: '#credits', title: 'Credits'}, [span('Credits')]),
        ]),
        h('span.footer-copyright', {}, 'Copyright (c) ' + (new Date()).getFullYear())
    ]);
}

function nav(action) {
    return h('ul.main-nav', {}, [
        h('li.logo'),
        navItem('main-nav', {href: '#', title: 'Home'}, [icons.home, span('Home')]),
        navItem('main-nav', {href: '#icons', title: 'Icons'}, [icons.icons, span('Icons')]),
        navItem('main-nav', {href: '#sandbox', title: 'Sandbox'}, [icons.sandbox, span('Sandbox')]),
        navItem('main-nav', {href: '#settings', title: 'Settings'}, [icons.settings, span('Settings')])
    ]);
}

function view(action, model) {
    return h('div.layout', {}, [
        header(action),
        h('div.main-body', {}, [
            h('div.main-left-col', {}, [
                nav(action),
                footer(action)
            ]),
            h('div.main-content', {}, 'Main content')
        ]),
    ]);
}

module.exports = {view: view};
