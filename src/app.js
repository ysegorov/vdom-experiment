
'use strict';

var snabbdom = require('snabbdom'),
    h = require('snabbdom/h'),
    patch = snabbdom.init([
        require('snabbdom/modules/class'),
        require('snabbdom/modules/style'),
        require('snabbdom/modules/props'),
        require('snabbdom/modules/eventlisteners')
    ]),
    _ = require('js/_'),
    Type = require('js/type'),
    globalEvents = require('js/window-events'),
    flyd = require('flyd'),
    Component = require('js/component');


// action


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
    Play: function play(evt, model) { return _.assoc('_paused', false, model); },
    Resize: function resize(evt, model) {console.log('resize', evt); return model; },
    VisibilityChange: function visibility(evt, model) {console.log('visibility', evt); return model; },
    Start: function start(model) { return model; }
});

// model

function init() {
    var b = [], cnt = 200, i;
    for (i=0; i<cnt; i+=1) {
        b.push(Component.init(i+2));
    }
    return {
        component: Component.init(1),
        blocks: b
    };
}


// view


var view = _.curryN(2, function (action, model) {
    var frwd = flyd.stream();
    var children = [
        h('button', {on: {click: _.compose(action, Msg.Add(model.blocks.length + 1))}}, '+'),
        h('button', {on: {click: _.compose(action, Msg.Clear)}}, '-'),
        h('button', {on: {click: _.compose(action, model._paused ? Msg.Play : Msg.Pause)}}, model._paused ? 'play' : 'pause'),
        h('hr'),
        Component.view(_.compose(frwd, Msg.Component), model.component)
    ];
    flyd.map(action, frwd);

    model.blocks.forEach(function (block, idx) {
        children.push(Component.view(_.compose(frwd, Msg.Block(idx)), block));
    });
    return h('div', {}, children);
});


// app

function app(elm) {

    var action = flyd.stream();
    var model = flyd.scan(_.flip(Msg.update), init(), action);
    // model.map(function (v) { console.log(v); });

    var vnode = flyd.map(view(action), model);
    flyd.scan(patch, elm, vnode);

    action(Msg.Start());

    var tickAction = _.compose(action, Msg.Tick);

    // TODO: pause/stop
    //
    console.time('timer');
    var cnt = 0;

    function runner() {
        cnt += 1;
        if (cnt % 360 === 0) {
            //clearInterval(interval);
            console.timeEnd('timer');
            console.time('timer');
            //return;
        }
        tickAction();
    }

    var interval = setInterval(runner, 10);

    flyd.map(function (m) {
        if (m._paused) {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        } else {
            if (interval === null) {
                interval = setInterval(runner, 10);
            }
        }
    }, model);

    globalEvents({resize: _.compose(action, Msg.Resize)},
                 {visibilitychange: _.compose(action, Msg.VisibilityChange)});
}

module.exports = app;
