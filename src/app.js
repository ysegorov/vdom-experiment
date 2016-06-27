
'use strict';

var snabbdom = require('snabbdom'),
    h = require('snabbdom/h'),
    patch = snabbdom.init([
        require('snabbdom/modules/class'),
        require('snabbdom/modules/style'),
        require('snabbdom/modules/props'),
        require('snabbdom/modules/eventlisteners')
    ]),
    cuid = require('cuid'),
    history = require('global').history,
    _ = require('js/_'),
    Type = require('js/type'),
    globalEvents = require('js/global-events'),
    stream = require('js/stream'),
    Component = require('js/component');


function pushState(loc) {
    history.pushState(loc, '', loc.href);
}

// action

function makeBlocks(cnt) {
    var b = [], i;
    for (i=0; i<cnt; i+=1) {
        b.push(Component.init(i+2));
    }
    return b;
}

var Msg = Type({
    Component: function component(msg, model) {
        return _.evolve({component: Component.update(msg)}, model);
    },
    Block: function block(idx, msg, model) {
        return _.evolve({blocks: _.adjust(Component.update(msg), idx)}, model);
    },
    Tick: function tick(model) {
        if (model._paused) {
            return model;
        }
        var fn = Component.update(Component.Tick());
        return _.evolve({blocks: _.map(fn), component: fn}, model);
    },
    Add: function add(idx, evt, model) {
        return _.evolve({blocks: _.append(Component.init(idx))}, model);
    },
    Clear: function clear(evt, model) {
        return _.evolve({blocks: function () { return []; }}, model);
    },
    Pause: function pause(evt, model) {
        return _.assoc('_paused', true, model);
    },
    Play: function play(evt, model) {
        return _.assoc('_paused', false, model);
    },
    Resize: function resize(evt, model) {
        console.log('resize', evt);
        return model;
    },
    Scroll: function scroll(evt, model) {
        console.log('scroll', evt);
        return model;
    },
    Visibility: function visibility(state, model) {
        console.log('visibility', state);
        return _.assoc('_paused', state, model);
    },
    Navigate: function navigate(loc, model) {
        var p = (loc.pathname || '/').slice(1);
        p = parseInt(p, 10);
        if (isNaN(p)) {
            p = 20;
        }
        return _.evolve({
            location: function () { return loc; },
            blocks: function () { return makeBlocks(p); }
        }, model);
    }
});

// model

function init() {
    return {
        cuid: cuid(),
        _paused: false,
        location: {},
        component: Component.init(1),
        blocks: makeBlocks(150)
    };
}


// view


var view = _.curryN(2, function (action, model) {
    function blur(evt) {
        evt.target.blur();
    }
    function preventDefault(evt) {
        evt.preventDefault();
    }
    function hrefToLocation(evt) {
        var link = evt.target;

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
    var nav = _.compose(action, Msg.Navigate, _.tap(pushState), hrefToLocation, _.tap(preventDefault));
    var children = [
        h('button', {
            on: {
                click: _.compose(action, Msg.Add(model.blocks.length + 1), _.tap(blur))
            }
        }, '+'),
        h('button', {
            on: {
                click: _.compose(action, Msg.Clear, _.tap(blur))
            }
        }, '-'),
        h('button', {
            on: {
                click: _.compose(action, model._paused ? Msg.Play : Msg.Pause, _.tap(blur))
            }
        }, model._paused ? 'play' : 'pause'),
        h('span', '::'),
        h('a', {props: {href: '/'}, on: {click: nav}}, 'home'),
        h('span', '::'),
        h('a', {props: {href: '/100'}, on: {click: nav}}, '100'),
        h('span', '::'),
        h('a', {props: {href: '/200'}, on: {click: nav}}, '200'),
        h('span', '::'),
        h('a', {props: {href: '/300'}, on: {click: nav}}, '300'),
        h('hr'),
        Component.view(_.compose(action, Msg.Component), model.component)
    ];

    model.blocks.forEach(function (block, idx) {
        children.push(Component.view(_.compose(action, Msg.Block(idx)), block));
    });
    return h('div', {key: model.cuid}, children);
});


// app

function app(Msg, init, elm, loc) {

    var action = stream();
    var model = action.scan(_.flip(Msg.update), init());
    // model.map(function (v) { console.log(v); });

    var vnode = model.map(view(action));
    vnode.scan(patch, elm);

    action(Msg.Navigate(loc));

    var tickAction = _.compose(action, Msg.Tick);


    console.time('timer');
    var timeout = 10;
    var cnt = 0, limit = 70, interval;

    function runner() {
        cnt += 1;
        if (cnt % 360 === 0) {
            //clearInterval(interval);
            console.timeEnd('timer');
            console.time('timer');
            limit -= 1;
            //return;
        }
        if (limit === 0) {
            clearInterval(interval);
            return ;
        }
        tickAction();
    }

    interval = setInterval(runner, timeout);

    model.map(function (m) {
        if (m._paused) {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        } else {
            if (interval === null) {
                interval = setInterval(runner, timeout);
            }
        }
    });

    var onResize = _.throttle(_.compose(action, Msg.Resize), 250);
    var onScroll = _.debounce(_.compose(action, Msg.Scroll), 100);
    var onPopstate = _.compose(action, Msg.Navigate, _.prop('state'));
    var onVisibility = _.compose(action, Msg.Visibility);
    var onVisibilityChange = _.compose(onVisibility, _.path(['target', 'hidden']));
    var onFocus = _.compose(onVisibility, _.always(false));
    var onBlur = _.compose(onVisibility, _.always(true));

    globalEvents({
        resize: onResize,
        scroll: onScroll,
        popstate: onPopstate,
        blur: onBlur,
        focus: onFocus
    },
    {
        visibilitychange: onVisibilityChange
    });
}

module.exports = _.curryN(4, app)(Msg, init);
