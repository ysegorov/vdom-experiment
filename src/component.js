
'use strict';

var h = require('snabbdom/h'),
    cuid = require('cuid'),
    Type = require('js/type'),
    _ = require('js/_');


// action

var Msg = Type({
    Click: function (evt, model) { return _.assoc('clicks', model.clicks + 1, model); },
    Remove: function (evt, model) { return _.assoc('_removed', true, model); },
    Tick: function (model) {
        return _.assoc('count', model.count > 359 ? 0 : model.count + 1, model);
    }
});

// model

function init(idx) {
    return {count: 0, clicks: 0, idx: idx, cuid: cuid(), _removed: false};
}

function isRemoved(model) {
    return _.prop('_removed', model) === true;
}

// view

function view(action, model)  {
    var count = model.count,
        clicks = model.clicks;

    var preventDefault = _.tap(function (evt) { evt.preventDefault(); });
    var clickAction = _.compose(action, Msg.Click, preventDefault);
    //var removeAction = _.compose(action, Msg.Remove, preventDefault);

    if (isRemoved(model)) {
        return '';
    }
    return h('div', {
        key: model.cuid,
        style: {
            textAlign: 'center',
            display: 'inline-block',
            border: '0px solid red',
            backgroundColor: 'steelblue',
            margin: '5px',
            borderRadius: '25px',
            lineHeight: '50px',
            width: '50px',
            height: '50px',
            transform: 'rotate(' + count + 'deg)'
        },
        on: {
            click: clickAction
        }
    }, [h('span', {key: model.cuid + '-i'}, String(count))
        //h('span', '/'),
        //h('span', String(clicks))
        // h('hr'),
        // h('button', {style: {lineHeight: 1}, on: {click: removeAction}}, '-')
    ]);
}


module.exports = {
    init: init,
    update: Msg.update,
    Click: Msg.Click,
    Tick: Msg.Tick,
    view: _.curryN(2, view)
};
