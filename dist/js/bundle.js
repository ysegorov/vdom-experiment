/*!
 * vdom-experiment
 * Yuri Egorov <ysegorov@gmail.com>
 * 0.1.0:1467803773845
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var app = __webpack_require__(1),
	    global = __webpack_require__(14),
	    doc = global.document;
	
	
	function run(evt) {
	    doc.removeEventListener('DOMContentLoaded', run);
	    app(doc.getElementById('body'), doc.location);
	}
	
	if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
	    run();
	} else {
	    doc.addEventListener('DOMContentLoaded', run);
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var snabbdom = __webpack_require__(2),
	    h = __webpack_require__(6),
	    patch = snabbdom.init([
	        __webpack_require__(7),
	        __webpack_require__(8),
	        __webpack_require__(9),
	        __webpack_require__(10),
	        __webpack_require__(11),
	        __webpack_require__(12)
	    ]),
	    cuid = __webpack_require__(13),
	    history = __webpack_require__(14).history,
	    _ = __webpack_require__(15),
	    Type = __webpack_require__(59),
	    nav = __webpack_require__(60),
	    icons = __webpack_require__(61),
	    layout = __webpack_require__(71),
	    globalEvents = __webpack_require__(73),
	    stream = __webpack_require__(74),
	    Component = __webpack_require__(75);
	
	
	// action/update
	
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
	        return _.evolve({
	            location: function () { return loc; }
	        }, model);
	    }
	});
	
	// model
	
	function init() {
	    return {
	        cuid: cuid(),
	        _paused: false,
	        location: {href: '/'},
	        component: Component.init(1),
	        blocks: makeBlocks(150)
	    };
	}
	
	
	// view
	
	var view = _.curryN(2, function view(action, model) {
	    return layout.view(action, model);
	});
	
	var blocksView = _.curryN(2, function (action, model) {
	    function blur(evt) {
	        evt.target.blur();
	    }
	    function preventDefault(evt) {
	        evt.preventDefault();
	    }
	    function pushState(loc) {
	        history.pushState(loc, '', loc.href);
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
	                click: _.compose(action, Msg.Add(model.blocks.length + 1), _.tap(preventDefault)),
	                keydown: _.tap(preventDefault)
	            }
	        }, [icons.plus]),
	        h('button', {
	            on: {
	                click: _.compose(action, Msg.Clear, _.tap(preventDefault)),
	                keydown: _.tap(preventDefault)
	            }
	        }, [icons.minus]),
	        h('button', {
	            on: {
	                click: _.compose(action, model._paused ? Msg.Play : Msg.Pause, _.tap(preventDefault)),
	                keydown: _.tap(preventDefault)
	            }
	        }, [model._paused ? icons.play : icons.pause]),
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
	    return h('div.layout', {key: model.cuid}, children);
	});
	
	
	// app
	
	function app(Msg, init, elm, loc) {
	
	    var action = stream();
	    var router = _.compose(action, Msg.Navigate, nav);
	    var model = action.scan(_.flip(Msg.update), init());
	    // model.map(function (v) { console.log(v); });
	
	    var vnode = model.map(view(action));
	    vnode.scan(patch, elm);
	
	    router(loc);
	    // action(Msg.Navigate(loc));
	
	    /*
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
	    */
	
	    var onResize = _.throttle(_.compose(action, Msg.Resize), 250);
	    var onScroll = _.debounce(_.compose(action, Msg.Scroll), 100);
	    var onPopstate = _.compose(action, Msg.Navigate, _.prop('state'));
	    var onVisibility = _.compose(action, Msg.Visibility);
	    var onVisibilityChange = _.compose(onVisibility, _.path(['target', 'hidden']));
	    var onFocus = _.compose(onVisibility, _.always(false));
	    var onBlur = _.compose(onVisibility, _.always(true));
	
	    function matched(selector) {
	        return function(elm) {
	            // requires dom4
	            return elm && (elm.matches(selector) ? elm : elm.closest(selector));
	        };
	    }
	    var matchedNavElm = _.compose(matched('.js-nav'), _.prop('target'));
	    var isNavEvent = _.compose(_.isDefined, matchedNavElm);
	    var preventDefault = _.tap(function(evt) { evt.preventDefault();});
	
	    globalEvents({
	        //resize: onResize,
	        scroll: onScroll,
	        popstate: onPopstate
	        //blur: onBlur,
	        //focus: onFocus
	    },
	    {
	        click: _.ifElse(isNavEvent,
	                       _.compose(router, matchedNavElm, preventDefault),
	                       _.noop)
	        //visibilitychange: onVisibilityChange
	    });
	}
	
	module.exports = _.curryN(4, app)(Msg, init);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// jshint newcap: false
	/* global require, module, document, Node */
	'use strict';
	
	var VNode = __webpack_require__(3);
	var is = __webpack_require__(4);
	var domApi = __webpack_require__(5);
	
	function isUndef(s) { return s === undefined; }
	function isDef(s) { return s !== undefined; }
	
	var emptyNode = VNode('', {}, [], undefined, undefined);
	
	function sameVnode(vnode1, vnode2) {
	  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
	}
	
	function createKeyToOldIdx(children, beginIdx, endIdx) {
	  var i, map = {}, key;
	  for (i = beginIdx; i <= endIdx; ++i) {
	    key = children[i].key;
	    if (isDef(key)) map[key] = i;
	  }
	  return map;
	}
	
	var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
	
	function init(modules, api) {
	  var i, j, cbs = {};
	
	  if (isUndef(api)) api = domApi;
	
	  for (i = 0; i < hooks.length; ++i) {
	    cbs[hooks[i]] = [];
	    for (j = 0; j < modules.length; ++j) {
	      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
	    }
	  }
	
	  function emptyNodeAt(elm) {
	    return VNode(api.tagName(elm).toLowerCase(), {}, [], undefined, elm);
	  }
	
	  function createRmCb(childElm, listeners) {
	    return function() {
	      if (--listeners === 0) {
	        var parent = api.parentNode(childElm);
	        api.removeChild(parent, childElm);
	      }
	    };
	  }
	
	  function createElm(vnode, insertedVnodeQueue) {
	    var i, data = vnode.data;
	    if (isDef(data)) {
	      if (isDef(i = data.hook) && isDef(i = i.init)) {
	        i(vnode);
	        data = vnode.data;
	      }
	    }
	    var elm, children = vnode.children, sel = vnode.sel;
	    if (isDef(sel)) {
	      // Parse selector
	      var hashIdx = sel.indexOf('#');
	      var dotIdx = sel.indexOf('.', hashIdx);
	      var hash = hashIdx > 0 ? hashIdx : sel.length;
	      var dot = dotIdx > 0 ? dotIdx : sel.length;
	      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
	      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
	                                                          : api.createElement(tag);
	      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
	      if (dotIdx > 0) elm.className = sel.slice(dot+1).replace(/\./g, ' ');
	      if (is.array(children)) {
	        for (i = 0; i < children.length; ++i) {
	          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
	        }
	      } else if (is.primitive(vnode.text)) {
	        api.appendChild(elm, api.createTextNode(vnode.text));
	      }
	      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
	      i = vnode.data.hook; // Reuse variable
	      if (isDef(i)) {
	        if (i.create) i.create(emptyNode, vnode);
	        if (i.insert) insertedVnodeQueue.push(vnode);
	      }
	    } else {
	      elm = vnode.elm = api.createTextNode(vnode.text);
	    }
	    return vnode.elm;
	  }
	
	  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
	    for (; startIdx <= endIdx; ++startIdx) {
	      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
	    }
	  }
	
	  function invokeDestroyHook(vnode) {
	    var i, j, data = vnode.data;
	    if (isDef(data)) {
	      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
	      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
	      if (isDef(i = vnode.children)) {
	        for (j = 0; j < vnode.children.length; ++j) {
	          invokeDestroyHook(vnode.children[j]);
	        }
	      }
	    }
	  }
	
	  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
	    for (; startIdx <= endIdx; ++startIdx) {
	      var i, listeners, rm, ch = vnodes[startIdx];
	      if (isDef(ch)) {
	        if (isDef(ch.sel)) {
	          invokeDestroyHook(ch);
	          listeners = cbs.remove.length + 1;
	          rm = createRmCb(ch.elm, listeners);
	          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
	          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
	            i(ch, rm);
	          } else {
	            rm();
	          }
	        } else { // Text node
	          api.removeChild(parentElm, ch.elm);
	        }
	      }
	    }
	  }
	
	  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
	    var oldStartIdx = 0, newStartIdx = 0;
	    var oldEndIdx = oldCh.length - 1;
	    var oldStartVnode = oldCh[0];
	    var oldEndVnode = oldCh[oldEndIdx];
	    var newEndIdx = newCh.length - 1;
	    var newStartVnode = newCh[0];
	    var newEndVnode = newCh[newEndIdx];
	    var oldKeyToIdx, idxInOld, elmToMove, before;
	
	    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
	      if (isUndef(oldStartVnode)) {
	        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
	      } else if (isUndef(oldEndVnode)) {
	        oldEndVnode = oldCh[--oldEndIdx];
	      } else if (sameVnode(oldStartVnode, newStartVnode)) {
	        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
	        oldStartVnode = oldCh[++oldStartIdx];
	        newStartVnode = newCh[++newStartIdx];
	      } else if (sameVnode(oldEndVnode, newEndVnode)) {
	        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
	        oldEndVnode = oldCh[--oldEndIdx];
	        newEndVnode = newCh[--newEndIdx];
	      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
	        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
	        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
	        oldStartVnode = oldCh[++oldStartIdx];
	        newEndVnode = newCh[--newEndIdx];
	      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
	        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
	        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
	        oldEndVnode = oldCh[--oldEndIdx];
	        newStartVnode = newCh[++newStartIdx];
	      } else {
	        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
	        idxInOld = oldKeyToIdx[newStartVnode.key];
	        if (isUndef(idxInOld)) { // New element
	          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
	          newStartVnode = newCh[++newStartIdx];
	        } else {
	          elmToMove = oldCh[idxInOld];
	          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
	          oldCh[idxInOld] = undefined;
	          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
	          newStartVnode = newCh[++newStartIdx];
	        }
	      }
	    }
	    if (oldStartIdx > oldEndIdx) {
	      before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
	      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
	    } else if (newStartIdx > newEndIdx) {
	      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
	    }
	  }
	
	  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
	    var i, hook;
	    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
	      i(oldVnode, vnode);
	    }
	    var elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
	    if (oldVnode === vnode) return;
	    if (!sameVnode(oldVnode, vnode)) {
	      var parentElm = api.parentNode(oldVnode.elm);
	      elm = createElm(vnode, insertedVnodeQueue);
	      api.insertBefore(parentElm, elm, oldVnode.elm);
	      removeVnodes(parentElm, [oldVnode], 0, 0);
	      return;
	    }
	    if (isDef(vnode.data)) {
	      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
	      i = vnode.data.hook;
	      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
	    }
	    if (isUndef(vnode.text)) {
	      if (isDef(oldCh) && isDef(ch)) {
	        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
	      } else if (isDef(ch)) {
	        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
	        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
	      } else if (isDef(oldCh)) {
	        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
	      } else if (isDef(oldVnode.text)) {
	        api.setTextContent(elm, '');
	      }
	    } else if (oldVnode.text !== vnode.text) {
	      api.setTextContent(elm, vnode.text);
	    }
	    if (isDef(hook) && isDef(i = hook.postpatch)) {
	      i(oldVnode, vnode);
	    }
	  }
	
	  return function(oldVnode, vnode) {
	    var i, elm, parent;
	    var insertedVnodeQueue = [];
	    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();
	
	    if (isUndef(oldVnode.sel)) {
	      oldVnode = emptyNodeAt(oldVnode);
	    }
	
	    if (sameVnode(oldVnode, vnode)) {
	      patchVnode(oldVnode, vnode, insertedVnodeQueue);
	    } else {
	      elm = oldVnode.elm;
	      parent = api.parentNode(elm);
	
	      createElm(vnode, insertedVnodeQueue);
	
	      if (parent !== null) {
	        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
	        removeVnodes(parent, [oldVnode], 0, 0);
	      }
	    }
	
	    for (i = 0; i < insertedVnodeQueue.length; ++i) {
	      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
	    }
	    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
	    return vnode;
	  };
	}
	
	module.exports = {init: init};


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function(sel, data, children, text, elm) {
	  var key = data === undefined ? undefined : data.key;
	  return {sel: sel, data: data, children: children,
	          text: text, elm: elm, key: key};
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = {
	  array: Array.isArray,
	  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	function createElement(tagName){
	  return document.createElement(tagName);
	}
	
	function createElementNS(namespaceURI, qualifiedName){
	  return document.createElementNS(namespaceURI, qualifiedName);
	}
	
	function createTextNode(text){
	  return document.createTextNode(text);
	}
	
	
	function insertBefore(parentNode, newNode, referenceNode){
	  parentNode.insertBefore(newNode, referenceNode);
	}
	
	
	function removeChild(node, child){
	  node.removeChild(child);
	}
	
	function appendChild(node, child){
	  node.appendChild(child);
	}
	
	function parentNode(node){
	  return node.parentElement;
	}
	
	function nextSibling(node){
	  return node.nextSibling;
	}
	
	function tagName(node){
	  return node.tagName;
	}
	
	function setTextContent(node, text){
	  node.textContent = text;
	}
	
	module.exports = {
	  createElement: createElement,
	  createElementNS: createElementNS,
	  createTextNode: createTextNode,
	  appendChild: appendChild,
	  removeChild: removeChild,
	  insertBefore: insertBefore,
	  parentNode: parentNode,
	  nextSibling: nextSibling,
	  tagName: tagName,
	  setTextContent: setTextContent
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var VNode = __webpack_require__(3);
	var is = __webpack_require__(4);
	
	function addNS(data, children) {
	  data.ns = 'http://www.w3.org/2000/svg';
	  if (children !== undefined) {
	    for (var i = 0; i < children.length; ++i) {
	      addNS(children[i].data, children[i].children);
	    }
	  }
	}
	
	module.exports = function h(sel, b, c) {
	  var data = {}, children, text, i;
	  if (c !== undefined) {
	    data = b;
	    if (is.array(c)) { children = c; }
	    else if (is.primitive(c)) { text = c; }
	  } else if (b !== undefined) {
	    if (is.array(b)) { children = b; }
	    else if (is.primitive(b)) { text = b; }
	    else { data = b; }
	  }
	  if (is.array(children)) {
	    for (i = 0; i < children.length; ++i) {
	      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
	    }
	  }
	  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
	    addNS(data, children);
	  }
	  return VNode(sel, data, children, text, undefined);
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	function updateClass(oldVnode, vnode) {
	  var cur, name, elm = vnode.elm,
	      oldClass = oldVnode.data.class || {},
	      klass = vnode.data.class || {};
	  for (name in oldClass) {
	    if (!klass[name]) {
	      elm.classList.remove(name);
	    }
	  }
	  for (name in klass) {
	    cur = klass[name];
	    if (cur !== oldClass[name]) {
	      elm.classList[cur ? 'add' : 'remove'](name);
	    }
	  }
	}
	
	module.exports = {create: updateClass, update: updateClass};


/***/ },
/* 8 */
/***/ function(module, exports) {

	var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare", 
	                "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable", 
	                "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple", 
	                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly", 
	                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate", 
	                "truespeed", "typemustmatch", "visible"];
	    
	var booleanAttrsDict = {};
	for(var i=0, len = booleanAttrs.length; i < len; i++) {
	  booleanAttrsDict[booleanAttrs[i]] = true;
	}
	    
	function updateAttrs(oldVnode, vnode) {
	  var key, cur, old, elm = vnode.elm,
	      oldAttrs = oldVnode.data.attrs || {}, attrs = vnode.data.attrs || {};
	  
	  // update modified attributes, add new attributes
	  for (key in attrs) {
	    cur = attrs[key];
	    old = oldAttrs[key];
	    if (old !== cur) {
	      // TODO: add support to namespaced attributes (setAttributeNS)
	      if(!cur && booleanAttrsDict[key])
	        elm.removeAttribute(key);
	      else
	        elm.setAttribute(key, cur);
	    }
	  }
	  //remove removed attributes
	  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
	  // the other option is to remove all attributes with value == undefined
	  for (key in oldAttrs) {
	    if (!(key in attrs)) {
	      elm.removeAttribute(key);
	    }
	  }
	}
	
	module.exports = {create: updateAttrs, update: updateAttrs};


/***/ },
/* 9 */
/***/ function(module, exports) {

	var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
	var nextFrame = function(fn) { raf(function() { raf(fn); }); };
	
	function setNextFrame(obj, prop, val) {
	  nextFrame(function() { obj[prop] = val; });
	}
	
	function updateStyle(oldVnode, vnode) {
	  var cur, name, elm = vnode.elm,
	      oldStyle = oldVnode.data.style || {},
	      style = vnode.data.style || {},
	      oldHasDel = 'delayed' in oldStyle;
	  for (name in oldStyle) {
	    if (!style[name]) {
	      elm.style[name] = '';
	    }
	  }
	  for (name in style) {
	    cur = style[name];
	    if (name === 'delayed') {
	      for (name in style.delayed) {
	        cur = style.delayed[name];
	        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
	          setNextFrame(elm.style, name, cur);
	        }
	      }
	    } else if (name !== 'remove' && cur !== oldStyle[name]) {
	      elm.style[name] = cur;
	    }
	  }
	}
	
	function applyDestroyStyle(vnode) {
	  var style, name, elm = vnode.elm, s = vnode.data.style;
	  if (!s || !(style = s.destroy)) return;
	  for (name in style) {
	    elm.style[name] = style[name];
	  }
	}
	
	function applyRemoveStyle(vnode, rm) {
	  var s = vnode.data.style;
	  if (!s || !s.remove) {
	    rm();
	    return;
	  }
	  var name, elm = vnode.elm, idx, i = 0, maxDur = 0,
	      compStyle, style = s.remove, amount = 0, applied = [];
	  for (name in style) {
	    applied.push(name);
	    elm.style[name] = style[name];
	  }
	  compStyle = getComputedStyle(elm);
	  var props = compStyle['transition-property'].split(', ');
	  for (; i < props.length; ++i) {
	    if(applied.indexOf(props[i]) !== -1) amount++;
	  }
	  elm.addEventListener('transitionend', function(ev) {
	    if (ev.target === elm) --amount;
	    if (amount === 0) rm();
	  });
	}
	
	module.exports = {create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle};


/***/ },
/* 10 */
/***/ function(module, exports) {

	function updateProps(oldVnode, vnode) {
	  var key, cur, old, elm = vnode.elm,
	      oldProps = oldVnode.data.props || {}, props = vnode.data.props || {};
	  for (key in oldProps) {
	    if (!props[key]) {
	      delete elm[key];
	    }
	  }
	  for (key in props) {
	    cur = props[key];
	    old = oldProps[key];
	    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
	      elm[key] = cur;
	    }
	  }
	}
	
	module.exports = {create: updateProps, update: updateProps};


/***/ },
/* 11 */
/***/ function(module, exports) {

	function updateDataset(oldVnode, vnode) {
	  var elm = vnode.elm,
	    oldDataset = oldVnode.data.dataset || {},
	    dataset = vnode.data.dataset || {},
	    key
	
	  for (key in oldDataset) {
	    if (!dataset[key]) {
	      delete elm.dataset[key];
	    }
	  }
	  for (key in dataset) {
	    if (oldDataset[key] !== dataset[key]) {
	      elm.dataset[key] = dataset[key];
	    }
	  }
	}
	
	module.exports = {create: updateDataset, update: updateDataset}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(4);
	
	function arrInvoker(arr) {
	  return function() {
	    if (!arr.length) return;
	    // Special case when length is two, for performance
	    arr.length === 2 ? arr[0](arr[1]) : arr[0].apply(undefined, arr.slice(1));
	  };
	}
	
	function fnInvoker(o) {
	  return function(ev) { 
	    if (o.fn === null) return;
	    o.fn(ev); 
	  };
	}
	
	function updateEventListeners(oldVnode, vnode) {
	  var name, cur, old, elm = vnode.elm,
	      oldOn = oldVnode.data.on || {}, on = vnode.data.on;
	  if (!on) return;
	  for (name in on) {
	    cur = on[name];
	    old = oldOn[name];
	    if (old === undefined) {
	      if (is.array(cur)) {
	        elm.addEventListener(name, arrInvoker(cur));
	      } else {
	        cur = {fn: cur};
	        on[name] = cur;
	        elm.addEventListener(name, fnInvoker(cur));
	      }
	    } else if (is.array(old)) {
	      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
	      old.length = cur.length;
	      for (var i = 0; i < old.length; ++i) old[i] = cur[i];
	      on[name]  = old;
	    } else {
	      old.fn = cur;
	      on[name] = old;
	    }
	  }
	  if (oldOn) {
	    for (name in oldOn) {
	      if (on[name] === undefined) {
	        var old = oldOn[name];
	        if (is.array(old)) {
	          old.length = 0;
	        }
	        else {
	          old.fn = null;
	        }
	      }
	    }
	  }
	}
	
	module.exports = {create: updateEventListeners, update: updateEventListeners};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * cuid.js
	 * Collision-resistant UID generator for browsers and node.
	 * Sequential for fast db lookups and recency sorting.
	 * Safe for element IDs and server-side lookups.
	 *
	 * Extracted from CLCTR
	 *
	 * Copyright (c) Eric Elliott 2012
	 * MIT License
	 */
	
	/*global window, navigator, document, require, process, module */
	(function (app) {
	  'use strict';
	  var namespace = 'cuid',
	    c = 0,
	    blockSize = 4,
	    base = 36,
	    discreteValues = Math.pow(base, blockSize),
	
	    pad = function pad(num, size) {
	      var s = "000000000" + num;
	      return s.substr(s.length-size);
	    },
	
	    randomBlock = function randomBlock() {
	      return pad((Math.random() *
	            discreteValues << 0)
	            .toString(base), blockSize);
	    },
	
	    safeCounter = function () {
	      c = (c < discreteValues) ? c : 0;
	      c++; // this is not subliminal
	      return c - 1;
	    },
	
	    api = function cuid() {
	      // Starting with a lowercase letter makes
	      // it HTML element ID friendly.
	      var letter = 'c', // hard-coded allows for sequential access
	
	        // timestamp
	        // warning: this exposes the exact date and time
	        // that the uid was created.
	        timestamp = (new Date().getTime()).toString(base),
	
	        // Prevent same-machine collisions.
	        counter,
	
	        // A few chars to generate distinct ids for different
	        // clients (so different computers are far less
	        // likely to generate the same id)
	        fingerprint = api.fingerprint(),
	
	        // Grab some more chars from Math.random()
	        random = randomBlock() + randomBlock();
	
	        counter = pad(safeCounter().toString(base), blockSize);
	
	      return  (letter + timestamp + counter + fingerprint + random);
	    };
	
	  api.slug = function slug() {
	    var date = new Date().getTime().toString(36),
	      counter,
	      print = api.fingerprint().slice(0,1) +
	        api.fingerprint().slice(-1),
	      random = randomBlock().slice(-2);
	
	      counter = safeCounter().toString(36).slice(-4);
	
	    return date.slice(-2) +
	      counter + print + random;
	  };
	
	  api.globalCount = function globalCount() {
	    // We want to cache the results of this
	    var cache = (function calc() {
	        var i,
	          count = 0;
	
	        for (i in window) {
	          count++;
	        }
	
	        return count;
	      }());
	
	    api.globalCount = function () { return cache; };
	    return cache;
	  };
	
	  api.fingerprint = function browserPrint() {
	    return pad((navigator.mimeTypes.length +
	      navigator.userAgent.length).toString(36) +
	      api.globalCount().toString(36), 4);
	  };
	
	  // don't change anything from here down.
	  if (app.register) {
	    app.register(namespace, api);
	  } else if (true) {
	    module.exports = api;
	  } else {
	    app[namespace] = api;
	  }
	
	}(this.applitude || this));


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = window;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var adjust = __webpack_require__(16),
	    append = __webpack_require__(22),
	    assoc = __webpack_require__(23),
	    compose = __webpack_require__(24),
	    curry = __webpack_require__(40),
	    curryN = __webpack_require__(41),
	    evolve = __webpack_require__(43),
	    flip = __webpack_require__(44),
	    ifElse = __webpack_require__(45),
	    is = __webpack_require__(46),
	    keys = __webpack_require__(47),
	    map = __webpack_require__(50),
	    path = __webpack_require__(56),
	    prop = __webpack_require__(57),
	    tap = __webpack_require__(58);
	
	var slice = [].slice;
	
	function isDefined(smth) {
	    return smth !== undefined && smth !== null;
	}
	
	function debounce(fn, timeout) {
	    var interval;
	    return function debounced() {
	        var args = slice.call(arguments);
	        clearTimeout(interval);
	        interval = setTimeout(function () {
	            fn.apply(null, args);
	        }, timeout);
	    };
	}
	
	function throttle(fn, timeout) {
	    var buff = [], interval;
	    return function throttled() {
	        buff.push(slice.call(arguments));
	        if (interval) { return ; }
	        interval = setInterval(function () {
	            if (buff.length) {
	                fn.apply(null, buff[buff.length - 1]);
	                buff = [];
	            } else {
	                clearInterval(interval);
	                interval = null;
	            }
	        }, timeout);
	    };
	}
	
	function always(smth) {
	    return function () {
	        return smth;
	    };
	}
	
	function noop() {}
	
	function trace(prefix) {
	    return function (smth) {
	        console.log(prefix, smth);
	    };
	}
	
	module.exports = {
	    isArray: Array.isArray,
	    isDefined: isDefined,
	    adjust: adjust,
	    always: always,
	    append: append,
	    assoc: assoc,
	    compose: compose,
	    curry: curry,
	    curryN: curryN,
	    debounce: debounce,
	    evolve: evolve,
	    flip: flip,
	    ifElse: ifElse,
	    is: is,
	    keys: keys,
	    map: map,
	    noop: noop,
	    path: path,
	    prop: prop,
	    tap: tap,
	    trace: trace,
	    throttle: throttle
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var _concat = __webpack_require__(17);
	var _curry3 = __webpack_require__(18);
	
	
	/**
	 * Applies a function to the value at the given index of an array, returning a
	 * new copy of the array with the element at the given index replaced with the
	 * result of the function application.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.14.0
	 * @category List
	 * @sig (a -> a) -> Number -> [a] -> [a]
	 * @param {Function} fn The function to apply.
	 * @param {Number} idx The index.
	 * @param {Array|Arguments} list An array-like object whose value
	 *        at the supplied index will be replaced.
	 * @return {Array} A copy of the supplied array-like object with
	 *         the element at index `idx` replaced with the value
	 *         returned by applying `fn` to the existing element.
	 * @see R.update
	 * @example
	 *
	 *      R.adjust(R.add(10), 1, [0, 1, 2]);     //=> [0, 11, 2]
	 *      R.adjust(R.add(10))(1)([0, 1, 2]);     //=> [0, 11, 2]
	 */
	module.exports = _curry3(function adjust(fn, idx, list) {
	  if (idx >= list.length || idx < -list.length) {
	    return list;
	  }
	  var start = idx < 0 ? list.length : 0;
	  var _idx = start + idx;
	  var _list = _concat(list);
	  _list[_idx] = fn(list[_idx]);
	  return _list;
	});


/***/ },
/* 17 */
/***/ function(module, exports) {

	/**
	 * Private `concat` function to merge two array-like objects.
	 *
	 * @private
	 * @param {Array|Arguments} [set1=[]] An array-like object.
	 * @param {Array|Arguments} [set2=[]] An array-like object.
	 * @return {Array} A new, merged array.
	 * @example
	 *
	 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	 */
	module.exports = function _concat(set1, set2) {
	  set1 = set1 || [];
	  set2 = set2 || [];
	  var idx;
	  var len1 = set1.length;
	  var len2 = set2.length;
	  var result = [];
	
	  idx = 0;
	  while (idx < len1) {
	    result[result.length] = set1[idx];
	    idx += 1;
	  }
	  idx = 0;
	  while (idx < len2) {
	    result[result.length] = set2[idx];
	    idx += 1;
	  }
	  return result;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var _curry2 = __webpack_require__(21);
	var _isPlaceholder = __webpack_require__(20);
	
	
	/**
	 * Optimized internal three-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry3(fn) {
	  return function f3(a, b, c) {
	    switch (arguments.length) {
	      case 0:
	        return f3;
	      case 1:
	        return _isPlaceholder(a) ? f3
	             : _curry2(function(_b, _c) { return fn(a, _b, _c); });
	      case 2:
	        return _isPlaceholder(a) && _isPlaceholder(b) ? f3
	             : _isPlaceholder(a) ? _curry2(function(_a, _c) { return fn(_a, b, _c); })
	             : _isPlaceholder(b) ? _curry2(function(_b, _c) { return fn(a, _b, _c); })
	             : _curry1(function(_c) { return fn(a, b, _c); });
	      default:
	        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3
	             : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) { return fn(_a, _b, c); })
	             : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) { return fn(_a, b, _c); })
	             : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) { return fn(a, _b, _c); })
	             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b, c); })
	             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b, c); })
	             : _isPlaceholder(c) ? _curry1(function(_c) { return fn(a, b, _c); })
	             : fn(a, b, c);
	    }
	  };
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var _isPlaceholder = __webpack_require__(20);
	
	
	/**
	 * Optimized internal one-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry1(fn) {
	  return function f1(a) {
	    if (arguments.length === 0 || _isPlaceholder(a)) {
	      return f1;
	    } else {
	      return fn.apply(this, arguments);
	    }
	  };
	};


/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function _isPlaceholder(a) {
	  return a != null &&
	         typeof a === 'object' &&
	         a['@@functional/placeholder'] === true;
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var _isPlaceholder = __webpack_require__(20);
	
	
	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry2(fn) {
	  return function f2(a, b) {
	    switch (arguments.length) {
	      case 0:
	        return f2;
	      case 1:
	        return _isPlaceholder(a) ? f2
	             : _curry1(function(_b) { return fn(a, _b); });
	      default:
	        return _isPlaceholder(a) && _isPlaceholder(b) ? f2
	             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b); })
	             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b); })
	             : fn(a, b);
	    }
	  };
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var _concat = __webpack_require__(17);
	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * Returns a new list containing the contents of the given list, followed by
	 * the given element.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig a -> [a] -> [a]
	 * @param {*} el The element to add to the end of the new list.
	 * @param {Array} list The list whose contents will be added to the beginning of the output
	 *        list.
	 * @return {Array} A new list containing the contents of the old list followed by `el`.
	 * @see R.prepend
	 * @example
	 *
	 *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
	 *      R.append('tests', []); //=> ['tests']
	 *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
	 */
	module.exports = _curry2(function append(el, list) {
	  return _concat(list, [el]);
	});


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var _curry3 = __webpack_require__(18);
	
	
	/**
	 * Makes a shallow clone of an object, setting or overriding the specified
	 * property with the given value. Note that this copies and flattens prototype
	 * properties onto the new object as well. All non-primitive properties are
	 * copied by reference.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.8.0
	 * @category Object
	 * @sig String -> a -> {k: v} -> {k: v}
	 * @param {String} prop the property name to set
	 * @param {*} val the new value
	 * @param {Object} obj the object to clone
	 * @return {Object} a new object similar to the original except for the specified property.
	 * @see R.dissoc
	 * @example
	 *
	 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
	 */
	module.exports = _curry3(function assoc(prop, val, obj) {
	  var result = {};
	  for (var p in obj) {
	    result[p] = obj[p];
	  }
	  result[prop] = val;
	  return result;
	});


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var pipe = __webpack_require__(25);
	var reverse = __webpack_require__(38);
	
	
	/**
	 * Performs right-to-left function composition. The rightmost function may have
	 * any arity; the remaining functions must be unary.
	 *
	 * **Note:** The result of compose is not automatically curried.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
	 * @param {...Function} functions
	 * @return {Function}
	 * @see R.pipe
	 * @example
	 *
	 *      var f = R.compose(R.inc, R.negate, Math.pow);
	 *
	 *      f(3, 4); // -(3^4) + 1
	 */
	module.exports = function compose() {
	  if (arguments.length === 0) {
	    throw new Error('compose requires at least one argument');
	  }
	  return pipe.apply(this, reverse(arguments));
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(26);
	var _pipe = __webpack_require__(27);
	var reduce = __webpack_require__(28);
	var tail = __webpack_require__(34);
	
	
	/**
	 * Performs left-to-right function composition. The leftmost function may have
	 * any arity; the remaining functions must be unary.
	 *
	 * In some libraries this function is named `sequence`.
	 *
	 * **Note:** The result of pipe is not automatically curried.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
	 * @param {...Function} functions
	 * @return {Function}
	 * @see R.compose
	 * @example
	 *
	 *      var f = R.pipe(Math.pow, R.negate, R.inc);
	 *
	 *      f(3, 4); // -(3^4) + 1
	 */
	module.exports = function pipe() {
	  if (arguments.length === 0) {
	    throw new Error('pipe requires at least one argument');
	  }
	  return _arity(arguments[0].length,
	                reduce(_pipe, arguments[0], tail(arguments)));
	};


/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = function _arity(n, fn) {
	  /* eslint-disable no-unused-vars */
	  switch (n) {
	    case 0: return function() { return fn.apply(this, arguments); };
	    case 1: return function(a0) { return fn.apply(this, arguments); };
	    case 2: return function(a0, a1) { return fn.apply(this, arguments); };
	    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
	    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
	    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
	    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
	    case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
	    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
	    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
	    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
	    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
	  }
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = function _pipe(f, g) {
	  return function() {
	    return g.call(this, f.apply(this, arguments));
	  };
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var _curry3 = __webpack_require__(18);
	var _reduce = __webpack_require__(29);
	
	
	/**
	 * Returns a single item by iterating through the list, successively calling
	 * the iterator function and passing it an accumulator value and the current
	 * value from the array, and then passing the result to the next call.
	 *
	 * The iterator function receives two values: *(acc, value)*. It may use
	 * `R.reduced` to shortcut the iteration.
	 *
	 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
	 * arrays), unlike the native `Array.prototype.reduce` method. For more details
	 * on this behavior, see:
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
	 *
	 * Dispatches to the `reduce` method of the third argument, if present.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig ((a, b) -> a) -> a -> [b] -> a
	 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	 *        current element from the array.
	 * @param {*} acc The accumulator value.
	 * @param {Array} list The list to iterate over.
	 * @return {*} The final, accumulated value.
	 * @see R.reduced, R.addIndex
	 * @example
	 *
	 *      var numbers = [1, 2, 3];
	 *      var add = (a, b) => a + b;
	 *
	 *      R.reduce(add, 10, numbers); //=> 16
	 */
	module.exports = _curry3(_reduce);


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var _xwrap = __webpack_require__(30);
	var bind = __webpack_require__(31);
	var isArrayLike = __webpack_require__(32);
	
	
	module.exports = (function() {
	  function _arrayReduce(xf, acc, list) {
	    var idx = 0;
	    var len = list.length;
	    while (idx < len) {
	      acc = xf['@@transducer/step'](acc, list[idx]);
	      if (acc && acc['@@transducer/reduced']) {
	        acc = acc['@@transducer/value'];
	        break;
	      }
	      idx += 1;
	    }
	    return xf['@@transducer/result'](acc);
	  }
	
	  function _iterableReduce(xf, acc, iter) {
	    var step = iter.next();
	    while (!step.done) {
	      acc = xf['@@transducer/step'](acc, step.value);
	      if (acc && acc['@@transducer/reduced']) {
	        acc = acc['@@transducer/value'];
	        break;
	      }
	      step = iter.next();
	    }
	    return xf['@@transducer/result'](acc);
	  }
	
	  function _methodReduce(xf, acc, obj) {
	    return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'], xf), acc));
	  }
	
	  var symIterator = (typeof Symbol !== 'undefined') ? Symbol.iterator : '@@iterator';
	  return function _reduce(fn, acc, list) {
	    if (typeof fn === 'function') {
	      fn = _xwrap(fn);
	    }
	    if (isArrayLike(list)) {
	      return _arrayReduce(fn, acc, list);
	    }
	    if (typeof list.reduce === 'function') {
	      return _methodReduce(fn, acc, list);
	    }
	    if (list[symIterator] != null) {
	      return _iterableReduce(fn, acc, list[symIterator]());
	    }
	    if (typeof list.next === 'function') {
	      return _iterableReduce(fn, acc, list);
	    }
	    throw new TypeError('reduce: list must be array or iterable');
	  };
	}());


/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = (function() {
	  function XWrap(fn) {
	    this.f = fn;
	  }
	  XWrap.prototype['@@transducer/init'] = function() {
	    throw new Error('init not implemented on XWrap');
	  };
	  XWrap.prototype['@@transducer/result'] = function(acc) { return acc; };
	  XWrap.prototype['@@transducer/step'] = function(acc, x) {
	    return this.f(acc, x);
	  };
	
	  return function _xwrap(fn) { return new XWrap(fn); };
	}());


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(26);
	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * Creates a function that is bound to a context.
	 * Note: `R.bind` does not provide the additional argument-binding capabilities of
	 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	 *
	 * @func
	 * @memberOf R
	 * @since v0.6.0
	 * @category Function
	 * @category Object
	 * @sig (* -> *) -> {*} -> (* -> *)
	 * @param {Function} fn The function to bind to context
	 * @param {Object} thisObj The context to bind `fn` to
	 * @return {Function} A function that will execute in the context of `thisObj`.
	 * @see R.partial
	 */
	module.exports = _curry2(function bind(fn, thisObj) {
	  return _arity(fn.length, function() {
	    return fn.apply(thisObj, arguments);
	  });
	});


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var _isArray = __webpack_require__(33);
	
	
	/**
	 * Tests whether or not an object is similar to an array.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.5.0
	 * @category Type
	 * @category List
	 * @sig * -> Boolean
	 * @param {*} x The object to test.
	 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
	 * @example
	 *
	 *      R.isArrayLike([]); //=> true
	 *      R.isArrayLike(true); //=> false
	 *      R.isArrayLike({}); //=> false
	 *      R.isArrayLike({length: 10}); //=> false
	 *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
	 */
	module.exports = _curry1(function isArrayLike(x) {
	  if (_isArray(x)) { return true; }
	  if (!x) { return false; }
	  if (typeof x !== 'object') { return false; }
	  if (x instanceof String) { return false; }
	  if (x.nodeType === 1) { return !!x.length; }
	  if (x.length === 0) { return true; }
	  if (x.length > 0) {
	    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
	  }
	  return false;
	});


/***/ },
/* 33 */
/***/ function(module, exports) {

	/**
	 * Tests whether or not an object is an array.
	 *
	 * @private
	 * @param {*} val The object to test.
	 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
	 * @example
	 *
	 *      _isArray([]); //=> true
	 *      _isArray(null); //=> false
	 *      _isArray({}); //=> false
	 */
	module.exports = Array.isArray || function _isArray(val) {
	  return (val != null &&
	          val.length >= 0 &&
	          Object.prototype.toString.call(val) === '[object Array]');
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var _checkForMethod = __webpack_require__(35);
	var slice = __webpack_require__(37);
	
	
	/**
	 * Returns all but the first element of the given list or string (or object
	 * with a `tail` method).
	 *
	 * Dispatches to the `slice` method of the first argument, if present.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig [a] -> [a]
	 * @sig String -> String
	 * @param {*} list
	 * @return {*}
	 * @see R.head, R.init, R.last
	 * @example
	 *
	 *      R.tail([1, 2, 3]);  //=> [2, 3]
	 *      R.tail([1, 2]);     //=> [2]
	 *      R.tail([1]);        //=> []
	 *      R.tail([]);         //=> []
	 *
	 *      R.tail('abc');  //=> 'bc'
	 *      R.tail('ab');   //=> 'b'
	 *      R.tail('a');    //=> ''
	 *      R.tail('');     //=> ''
	 */
	module.exports = _checkForMethod('tail', slice(1, Infinity));


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var _isArray = __webpack_require__(33);
	var _slice = __webpack_require__(36);
	
	
	/**
	 * Similar to hasMethod, this checks whether a function has a [methodname]
	 * function. If it isn't an array it will execute that function otherwise it
	 * will default to the ramda implementation.
	 *
	 * @private
	 * @param {Function} fn ramda implemtation
	 * @param {String} methodname property to check for a custom implementation
	 * @return {Object} Whatever the return value of the method is.
	 */
	module.exports = function _checkForMethod(methodname, fn) {
	  return function() {
	    var length = arguments.length;
	    if (length === 0) {
	      return fn();
	    }
	    var obj = arguments[length - 1];
	    return (_isArray(obj) || typeof obj[methodname] !== 'function') ?
	      fn.apply(this, arguments) :
	      obj[methodname].apply(obj, _slice(arguments, 0, length - 1));
	  };
	};


/***/ },
/* 36 */
/***/ function(module, exports) {

	/**
	 * An optimized, private array `slice` implementation.
	 *
	 * @private
	 * @param {Arguments|Array} args The array or arguments object to consider.
	 * @param {Number} [from=0] The array index to slice from, inclusive.
	 * @param {Number} [to=args.length] The array index to slice to, exclusive.
	 * @return {Array} A new, sliced array.
	 * @example
	 *
	 *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
	 *
	 *      var firstThreeArgs = function(a, b, c, d) {
	 *        return _slice(arguments, 0, 3);
	 *      };
	 *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
	 */
	module.exports = function _slice(args, from, to) {
	  switch (arguments.length) {
	    case 1: return _slice(args, 0, args.length);
	    case 2: return _slice(args, from, args.length);
	    default:
	      var list = [];
	      var idx = 0;
	      var len = Math.max(0, Math.min(args.length, to) - from);
	      while (idx < len) {
	        list[idx] = args[from + idx];
	        idx += 1;
	      }
	      return list;
	  }
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var _checkForMethod = __webpack_require__(35);
	var _curry3 = __webpack_require__(18);
	
	
	/**
	 * Returns the elements of the given list or string (or object with a `slice`
	 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
	 *
	 * Dispatches to the `slice` method of the third argument, if present.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.4
	 * @category List
	 * @sig Number -> Number -> [a] -> [a]
	 * @sig Number -> Number -> String -> String
	 * @param {Number} fromIndex The start index (inclusive).
	 * @param {Number} toIndex The end index (exclusive).
	 * @param {*} list
	 * @return {*}
	 * @example
	 *
	 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
	 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
	 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
	 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
	 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
	 */
	module.exports = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
	  return Array.prototype.slice.call(list, fromIndex, toIndex);
	}));


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var _isString = __webpack_require__(39);
	var _slice = __webpack_require__(36);
	
	
	/**
	 * Returns a new list or string with the elements or characters in reverse
	 * order.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig [a] -> [a]
	 * @sig String -> String
	 * @param {Array|String} list
	 * @return {Array|String}
	 * @example
	 *
	 *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
	 *      R.reverse([1, 2]);     //=> [2, 1]
	 *      R.reverse([1]);        //=> [1]
	 *      R.reverse([]);         //=> []
	 *
	 *      R.reverse('abc');      //=> 'cba'
	 *      R.reverse('ab');       //=> 'ba'
	 *      R.reverse('a');        //=> 'a'
	 *      R.reverse('');         //=> ''
	 */
	module.exports = _curry1(function reverse(list) {
	  return _isString(list) ? list.split('').reverse().join('') :
	                           _slice(list).reverse();
	});


/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = function _isString(x) {
	  return Object.prototype.toString.call(x) === '[object String]';
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var curryN = __webpack_require__(41);
	
	
	/**
	 * Returns a curried equivalent of the provided function. The curried function
	 * has two unusual capabilities. First, its arguments needn't be provided one
	 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (* -> a) -> (* -> a)
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curryN
	 * @example
	 *
	 *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
	 *
	 *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry1(function curry(fn) {
	  return curryN(fn.length, fn);
	});


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(26);
	var _curry1 = __webpack_require__(19);
	var _curry2 = __webpack_require__(21);
	var _curryN = __webpack_require__(42);
	
	
	/**
	 * Returns a curried equivalent of the provided function, with the specified
	 * arity. The curried function has two unusual capabilities. First, its
	 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.5.0
	 * @category Function
	 * @sig Number -> (* -> a) -> (* -> a)
	 * @param {Number} length The arity for the returned function.
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curry
	 * @example
	 *
	 *      var sumArgs = (...args) => R.sum(args);
	 *
	 *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry2(function curryN(length, fn) {
	  if (length === 1) {
	    return _curry1(fn);
	  }
	  return _arity(length, _curryN(length, [], fn));
	});


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(26);
	var _isPlaceholder = __webpack_require__(20);
	
	
	/**
	 * Internal curryN function.
	 *
	 * @private
	 * @category Function
	 * @param {Number} length The arity of the curried function.
	 * @param {Array} received An array of arguments received thus far.
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curryN(length, received, fn) {
	  return function() {
	    var combined = [];
	    var argsIdx = 0;
	    var left = length;
	    var combinedIdx = 0;
	    while (combinedIdx < received.length || argsIdx < arguments.length) {
	      var result;
	      if (combinedIdx < received.length &&
	          (!_isPlaceholder(received[combinedIdx]) ||
	           argsIdx >= arguments.length)) {
	        result = received[combinedIdx];
	      } else {
	        result = arguments[argsIdx];
	        argsIdx += 1;
	      }
	      combined[combinedIdx] = result;
	      if (!_isPlaceholder(result)) {
	        left -= 1;
	      }
	      combinedIdx += 1;
	    }
	    return left <= 0 ? fn.apply(this, combined)
	                     : _arity(left, _curryN(length, combined, fn));
	  };
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * Creates a new object by recursively evolving a shallow copy of `object`,
	 * according to the `transformation` functions. All non-primitive properties
	 * are copied by reference.
	 *
	 * A `transformation` function will not be invoked if its corresponding key
	 * does not exist in the evolved object.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.9.0
	 * @category Object
	 * @sig {k: (v -> v)} -> {k: v} -> {k: v}
	 * @param {Object} transformations The object specifying transformation functions to apply
	 *        to the object.
	 * @param {Object} object The object to be transformed.
	 * @return {Object} The transformed object.
	 * @example
	 *
	 *      var tomato  = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
	 *      var transformations = {
	 *        firstName: R.trim,
	 *        lastName: R.trim, // Will not get invoked.
	 *        data: {elapsed: R.add(1), remaining: R.add(-1)}
	 *      };
	 *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
	 */
	module.exports = _curry2(function evolve(transformations, object) {
	  var result = {};
	  var transformation, key, type;
	  for (key in object) {
	    transformation = transformations[key];
	    type = typeof transformation;
	    result[key] = type === 'function' ? transformation(object[key])
	                : type === 'object'   ? evolve(transformations[key], object[key])
	                                      : object[key];
	  }
	  return result;
	});


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var _slice = __webpack_require__(36);
	var curry = __webpack_require__(40);
	
	
	/**
	 * Returns a new function much like the supplied one, except that the first two
	 * arguments' order is reversed.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (a -> b -> c -> ... -> z) -> (b -> a -> c -> ... -> z)
	 * @param {Function} fn The function to invoke with its first two parameters reversed.
	 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
	 * @example
	 *
	 *      var mergeThree = (a, b, c) => [].concat(a, b, c);
	 *
	 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
	 *
	 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
	 */
	module.exports = _curry1(function flip(fn) {
	  return curry(function(a, b) {
	    var args = _slice(arguments);
	    args[0] = b;
	    args[1] = a;
	    return fn.apply(this, args);
	  });
	});


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var _curry3 = __webpack_require__(18);
	var curryN = __webpack_require__(41);
	
	
	/**
	 * Creates a function that will process either the `onTrue` or the `onFalse`
	 * function depending upon the result of the `condition` predicate.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.8.0
	 * @category Logic
	 * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
	 * @param {Function} condition A predicate function
	 * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
	 * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
	 * @return {Function} A new unary function that will process either the `onTrue` or the `onFalse`
	 *                    function depending upon the result of the `condition` predicate.
	 * @see R.unless, R.when
	 * @example
	 *
	 *      var incCount = R.ifElse(
	 *        R.has('count'),
	 *        R.over(R.lensProp('count'), R.inc),
	 *        R.assoc('count', 1)
	 *      );
	 *      incCount({});           //=> { count: 1 }
	 *      incCount({ count: 1 }); //=> { count: 2 }
	 */
	module.exports = _curry3(function ifElse(condition, onTrue, onFalse) {
	  return curryN(Math.max(condition.length, onTrue.length, onFalse.length),
	    function _ifElse() {
	      return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
	    }
	  );
	});


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * See if an object (`val`) is an instance of the supplied constructor. This
	 * function will check up the inheritance chain, if any.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.3.0
	 * @category Type
	 * @sig (* -> {*}) -> a -> Boolean
	 * @param {Object} ctor A constructor
	 * @param {*} val The value to test
	 * @return {Boolean}
	 * @example
	 *
	 *      R.is(Object, {}); //=> true
	 *      R.is(Number, 1); //=> true
	 *      R.is(Object, 1); //=> false
	 *      R.is(String, 's'); //=> true
	 *      R.is(String, new String('')); //=> true
	 *      R.is(Object, new String('')); //=> true
	 *      R.is(Object, 's'); //=> false
	 *      R.is(Number, {}); //=> false
	 */
	module.exports = _curry2(function is(Ctor, val) {
	  return val != null && val.constructor === Ctor || val instanceof Ctor;
	});


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(19);
	var _has = __webpack_require__(48);
	var _isArguments = __webpack_require__(49);
	
	
	/**
	 * Returns a list containing the names of all the enumerable own properties of
	 * the supplied object.
	 * Note that the order of the output array is not guaranteed to be consistent
	 * across different JS platforms.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Object
	 * @sig {k: v} -> [k]
	 * @param {Object} obj The object to extract properties from
	 * @return {Array} An array of the object's own properties.
	 * @example
	 *
	 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
	 */
	module.exports = (function() {
	  // cover IE < 9 keys issues
	  var hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString',
	                            'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
	  // Safari bug
	  var hasArgsEnumBug = (function() {
	    'use strict';
	    return arguments.propertyIsEnumerable('length');
	  }());
	
	  var contains = function contains(list, item) {
	    var idx = 0;
	    while (idx < list.length) {
	      if (list[idx] === item) {
	        return true;
	      }
	      idx += 1;
	    }
	    return false;
	  };
	
	  return typeof Object.keys === 'function' && !hasArgsEnumBug ?
	    _curry1(function keys(obj) {
	      return Object(obj) !== obj ? [] : Object.keys(obj);
	    }) :
	    _curry1(function keys(obj) {
	      if (Object(obj) !== obj) {
	        return [];
	      }
	      var prop, nIdx;
	      var ks = [];
	      var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
	      for (prop in obj) {
	        if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
	          ks[ks.length] = prop;
	        }
	      }
	      if (hasEnumBug) {
	        nIdx = nonEnumerableProps.length - 1;
	        while (nIdx >= 0) {
	          prop = nonEnumerableProps[nIdx];
	          if (_has(prop, obj) && !contains(ks, prop)) {
	            ks[ks.length] = prop;
	          }
	          nIdx -= 1;
	        }
	      }
	      return ks;
	    });
	}());


/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = function _has(prop, obj) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var _has = __webpack_require__(48);
	
	
	module.exports = (function() {
	  var toString = Object.prototype.toString;
	  return toString.call(arguments) === '[object Arguments]' ?
	    function _isArguments(x) { return toString.call(x) === '[object Arguments]'; } :
	    function _isArguments(x) { return _has('callee', x); };
	}());


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	var _dispatchable = __webpack_require__(51);
	var _map = __webpack_require__(53);
	var _reduce = __webpack_require__(29);
	var _xmap = __webpack_require__(54);
	var curryN = __webpack_require__(41);
	var keys = __webpack_require__(47);
	
	
	/**
	 * Takes a function and
	 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
	 * applies the function to each of the functor's values, and returns
	 * a functor of the same shape.
	 *
	 * Ramda provides suitable `map` implementations for `Array` and `Object`,
	 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
	 *
	 * Dispatches to the `map` method of the second argument, if present.
	 *
	 * Acts as a transducer if a transformer is given in list position.
	 *
	 * Also treats functions as functors and will compose them together.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig Functor f => (a -> b) -> f a -> f b
	 * @param {Function} fn The function to be called on every element of the input `list`.
	 * @param {Array} list The list to be iterated over.
	 * @return {Array} The new list.
	 * @see R.transduce, R.addIndex
	 * @example
	 *
	 *      var double = x => x * 2;
	 *
	 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
	 *
	 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
	 */
	module.exports = _curry2(_dispatchable('map', _xmap, function map(fn, functor) {
	  switch (Object.prototype.toString.call(functor)) {
	    case '[object Function]':
	      return curryN(functor.length, function() {
	        return fn.call(this, functor.apply(this, arguments));
	      });
	    case '[object Object]':
	      return _reduce(function(acc, key) {
	        acc[key] = fn(functor[key]);
	        return acc;
	      }, {}, keys(functor));
	    default:
	      return _map(fn, functor);
	  }
	}));


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var _isArray = __webpack_require__(33);
	var _isTransformer = __webpack_require__(52);
	var _slice = __webpack_require__(36);
	
	
	/**
	 * Returns a function that dispatches with different strategies based on the
	 * object in list position (last argument). If it is an array, executes [fn].
	 * Otherwise, if it has a function with [methodname], it will execute that
	 * function (functor case). Otherwise, if it is a transformer, uses transducer
	 * [xf] to return a new transformer (transducer case). Otherwise, it will
	 * default to executing [fn].
	 *
	 * @private
	 * @param {String} methodname property to check for a custom implementation
	 * @param {Function} xf transducer to initialize if object is transformer
	 * @param {Function} fn default ramda implementation
	 * @return {Function} A function that dispatches on object in list position
	 */
	module.exports = function _dispatchable(methodname, xf, fn) {
	  return function() {
	    var length = arguments.length;
	    if (length === 0) {
	      return fn();
	    }
	    var obj = arguments[length - 1];
	    if (!_isArray(obj)) {
	      var args = _slice(arguments, 0, length - 1);
	      if (typeof obj[methodname] === 'function') {
	        return obj[methodname].apply(obj, args);
	      }
	      if (_isTransformer(obj)) {
	        var transducer = xf.apply(null, args);
	        return transducer(obj);
	      }
	    }
	    return fn.apply(this, arguments);
	  };
	};


/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = function _isTransformer(obj) {
	  return typeof obj['@@transducer/step'] === 'function';
	};


/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = function _map(fn, functor) {
	  var idx = 0;
	  var len = functor.length;
	  var result = Array(len);
	  while (idx < len) {
	    result[idx] = fn(functor[idx]);
	    idx += 1;
	  }
	  return result;
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	var _xfBase = __webpack_require__(55);
	
	
	module.exports = (function() {
	  function XMap(f, xf) {
	    this.xf = xf;
	    this.f = f;
	  }
	  XMap.prototype['@@transducer/init'] = _xfBase.init;
	  XMap.prototype['@@transducer/result'] = _xfBase.result;
	  XMap.prototype['@@transducer/step'] = function(result, input) {
	    return this.xf['@@transducer/step'](result, this.f(input));
	  };
	
	  return _curry2(function _xmap(f, xf) { return new XMap(f, xf); });
	}());


/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = {
	  init: function() {
	    return this.xf['@@transducer/init']();
	  },
	  result: function(result) {
	    return this.xf['@@transducer/result'](result);
	  }
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * Retrieve the value at a given path.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.2.0
	 * @category Object
	 * @sig [String] -> {k: v} -> v | Undefined
	 * @param {Array} path The path to use.
	 * @param {Object} obj The object to retrieve the nested property from.
	 * @return {*} The data at `path`.
	 * @example
	 *
	 *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
	 *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
	 */
	module.exports = _curry2(function path(paths, obj) {
	  var val = obj;
	  var idx = 0;
	  while (idx < paths.length) {
	    if (val == null) {
	      return;
	    }
	    val = val[paths[idx]];
	    idx += 1;
	  }
	  return val;
	});


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * Returns a function that when supplied an object returns the indicated
	 * property of that object, if it exists.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Object
	 * @sig s -> {s: a} -> a | Undefined
	 * @param {String} p The property name
	 * @param {Object} obj The object to query
	 * @return {*} The value at `obj.p`.
	 * @example
	 *
	 *      R.prop('x', {x: 100}); //=> 100
	 *      R.prop('x', {}); //=> undefined
	 */
	module.exports = _curry2(function prop(p, obj) { return obj[p]; });


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(21);
	
	
	/**
	 * Runs the given function with the supplied object, then returns the object.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (a -> *) -> a -> a
	 * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
	 * @param {*} x
	 * @return {*} `x`.
	 * @example
	 *
	 *      var sayX = x => console.log('x is ' + x);
	 *      R.tap(sayX, 100); //=> 100
	 *      //-> 'x is 100'
	 */
	module.exports = _curry2(function tap(fn, x) {
	  fn(x);
	  return x;
	});


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var _ = __webpack_require__(15);
	
	
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


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var _ = __webpack_require__(15),
	    history = __webpack_require__(14).history;
	
	
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


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var plus = __webpack_require__(62),
	    play = __webpack_require__(63),
	    pause = __webpack_require__(64),
	    logo = __webpack_require__(65),
	    minus = __webpack_require__(66),
	    home = __webpack_require__(67),
	    sandbox = __webpack_require__(68),
	    icons = __webpack_require__(69),
	    settings = __webpack_require__(70);
	
	module.exports = {
	    home: home,
	    icons: icons,
	    logo: logo,
	    minus: minus,
	    plus: plus,
	    play: play,
	    pause: pause,
	    sandbox: sandbox,
	    settings: settings
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-plus',
	attrs: {"viewBox":"0 0 64 64","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M52 29H35V12a3 3 0 1 0-6 0v17H12a3 3 0 1 0 0 6h17v17a3 3 0 1 0 6 0V35h17a3 3 0 1 0 0-6z"}},
	[])]);

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-play',
	attrs: {"viewBox":"0 0 64 64","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M46 32c0-1.099-.592-2.06-1.475-2.583L22.561 16.438l-.024-.014-.011-.007A3 3 0 0 0 18 19v26a3 3 0 0 0 4.526 2.583l.011-.007a.15.15 0 0 1 .024-.014l21.964-12.979A2.997 2.997 0 0 0 46 32z"}},
	[])]);

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-pause',
	attrs: {"viewBox":"0 0 64 64","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M26 19a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0V22a3 3 0 0 0-3-3zm12 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0V22a3 3 0 0 0-3-3z"}},
	[])]);

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-logo',
	attrs: {"viewBox":"0 0 62.173818 35.30668","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M41.36.26c-.147 0-.264.056-.402.135-.097.048-.235.113-.41.193-.184.067-.42.143-.71.229a.237.237 0 0 0-.003 0c-.254.079-.586.138-.99.172a.237.237 0 0 0-.005 0c-.362.034-.67.06-.927.078h.015a.587.587 0 0 0-.455.195c-.11.133-.144.303-.144.482 0 .118.022.235.09.338s.182.177.296.205c.15.038.307.066.473.084.13.015.25.048.363.104a.237.237 0 0 0 .022.012c.02.008.02.007.03.025a.32.32 0 0 1 .024.143c0 .072-.008.207-.025.394a3.473 3.473 0 0 1-.123.58.237.237 0 0 0 0 .004l-2.443 9.334a.237.237 0 0 0-.002.004c-.14.559-.253 1.075-.34 1.549a6.766 6.766 0 0 0-.135 1.266c0 1.111.262 2.007.81 2.65a.237.237 0 0 0 .003.002c.564.64 1.348.963 2.285.963.818 0 1.641-.2 2.465-.594l.002-.002c.845-.396 1.642-.995 2.386-1.793a.237.237 0 0 0 .002-.004 10.33 10.33 0 0 0 1.944-3.111.237.237 0 0 0 0-.002c.46-1.168.691-2.315.691-3.44 0-1.173-.24-2.117-.744-2.812L45.4 7.64c-.484-.705-1.153-1.088-1.936-1.088-.818 0-1.636.462-2.459 1.32a.237.237 0 0 0 0 .002c-.525.56-1.09 1.367-1.673 2.285l2.435-8.293v-.004c.14-.453.219-.733.219-.95 0-.177-.043-.349-.162-.475A.627.627 0 0 0 41.36.26zm11.035 1.717c-.24 0-.476.08-.684.224a.237.237 0 0 0-.008.006c-.176.137-.338.31-.488.516-.153.21-.276.447-.369.709a.237.237 0 0 0-.006.016 2.878 2.878 0 0 0-.111.793c0 .445.082.822.271 1.117a.237.237 0 0 0 .004.006c.196.282.516.44.871.44.485 0 .908-.284 1.213-.76a.237.237 0 0 0 .002-.003c.302-.49.451-1.068.451-1.71 0-.369-.1-.699-.31-.954-.197-.26-.502-.4-.836-.4zm-1.144 4.576c-.47 0-.933.158-1.38.455a.237.237 0 0 0-.003.002c-.422.293-.883.722-1.393 1.285-.438.491-.768.904-.988 1.252a3.89 3.89 0 0 0-.248.444.83.83 0 0 0-.098.359c0 .14.02.27.1.387.08.117.234.187.369.187.254 0 .433-.165.625-.394.177-.213.362-.452.554-.715.184-.251.367-.475.55-.674.186-.187.328-.244.378-.244.052 0 .037 0 .043.01.006.008.031.06.031.17a4.7 4.7 0 0 1-.146.637l-1.637 5.168a.237.237 0 0 0 0 .004 13.764 13.764 0 0 0-.424 1.744 8.361 8.361 0 0 0-.132 1.34c0 .43.084.785.292 1.044.21.26.537.387.907.387.42 0 .867-.148 1.342-.422.479-.276.977-.697 1.507-1.264a.237.237 0 0 0 .004-.004c.44-.491.758-.899.961-1.232v.004c.108-.17.19-.316.248-.443.06-.128.1-.231.1-.36a.54.54 0 0 0-.139-.357.48.48 0 0 0-.357-.19c-.26 0-.41.169-.598.395-.177.212-.363.451-.556.715a7.32 7.32 0 0 1-.575.648c-.184.185-.326.244-.404.244-.043 0-.029-.004-.02.006.01.01-.003.003-.003-.056 0-.076.03-.312.097-.647l.002-.006v-.002c.084-.352.22-.812.408-1.377a.237.237 0 0 0 0-.002l1.56-4.836a.237.237 0 0 0 .003-.002c.14-.456.247-.863.318-1.22.071-.356.108-.643.108-.877 0-.477-.105-.87-.352-1.15-.247-.28-.62-.413-1.055-.413zm7.74.05a3.57 3.57 0 0 0-1.56.362c-.492.237-.93.547-1.313.93-.382.381-.69.812-.926 1.285v-.004c-.24.462-.363.934-.363 1.408 0 .763.33 1.555.957 2.38l1.43 1.898c.254.34.465.66.632.96.152.273.23.594.23.977 0 .411-.099.715-.285.943a.237.237 0 0 0-.006.006c-.175.235-.344.323-.564.323-.248 0-.493-.096-.754-.309-.253-.238-.536-.6-.838-1.086l-.002-.002c-.24-.394-.436-.727-.59-1l-.002-.004c-.181-.34-.483-.564-.832-.564a.698.698 0 0 0-.466.181c-.127.116-.215.271-.282.455-.134.369-.19.868-.19 1.524 0 .628.313 1.176.88 1.572a.237.237 0 0 0 .008.006c.582.376 1.3.557 2.13.557.549 0 1.082-.111 1.592-.328l.006-.002c.524-.2.99-.472 1.391-.819.402-.347.726-.754.965-1.213l.002-.002c.259-.482.39-.998.39-1.539 0-.59-.13-1.127-.394-1.597a13.007 13.007 0 0 0-.9-1.377.237.237 0 0 0 0-.002l-1.223-1.612a.237.237 0 0 0-.002-.002 8.29 8.29 0 0 1-.756-1.13v-.003s-.002 0-.002-.002c-.162-.324-.234-.59-.234-.775 0-.259.075-.433.236-.58a.237.237 0 0 0 .008-.006.805.805 0 0 1 .613-.244c.235 0 .451.085.678.281a.237.237 0 0 0 .006.006c.248.198.478.422.695.672a.237.237 0 0 0 .006.008c.245.262.482.507.71.734a.237.237 0 0 0 .007.006c.255.235.539.373.836.373.33 0 .624-.2.778-.507.153-.308.212-.714.212-1.237 0-.613-.328-1.122-.904-1.43-.56-.316-1.235-.47-2.01-.47zm-42.256.843c-.316 0-.553.026-.742.168a2.453 2.453 0 0 0-.4.396L.796 24.604a.237.237 0 0 0-.002.004 2.438 2.438 0 0 0-.398.621c-.098.229-.139.5-.139.815 0 .32.124.61.365.789.241.178.562.246.951.246h7.76c.175 0 .291.02.352.037-.004.028-.004.024-.014.072-.019.096-.048.23-.088.402l-.838 3.235c-.184.684-.37 1.233-.549 1.642-.158.364-.404.552-.822.622a.237.237 0 0 0-.01.002 8.31 8.31 0 0 1-.972.156h.021c-.274 0-.51.012-.713.04-.213.031-.4.094-.549.206-.188.141-.254.378-.254.63 0 .253.067.485.229.647.162.163.394.229.646.229.18 0 .573-.041 1.268-.121l-.002.002c.704-.079 1.726-.121 3.055-.121 1.168 0 2.054.041 2.648.119.616.08.973.12 1.152.12.305 0 .554-.04.754-.163a.701.701 0 0 0 .323-.592.77.77 0 0 0-.149-.475.814.814 0 0 0-.418-.271h-.002a5.79 5.79 0 0 0-.847-.203A4.311 4.311 0 0 1 12.78 33c-.155-.107-.25-.3-.25-.678 0-.243.036-.502.111-.777a.237.237 0 0 0 .002-.006l.961-3.881a.237.237 0 0 0 .002-.01c.052-.258.106-.435.14-.5a.237.237 0 0 0 .01-.018c-.004.008-.014.003.038-.015a.964.964 0 0 1 .299-.037h1.76c.116 0 .213-.006.303-.026.089-.02.199-.044.27-.185a.237.237 0 0 0 .013-.032l.119-.359a.237.237 0 0 0 .004-.01l.16-.56a.237.237 0 0 0 .008-.065v-.04l-.068.169a.403.403 0 0 0 .109-.29.556.556 0 0 0-.17-.417.627.627 0 0 0-.428-.139h-1.56c-.179 0-.3-.022-.352-.04l.014-.06.09-.367-.002.002 2.191-8.529.008-.03c.052-.134.088-.255.088-.378v-.201a.67.67 0 0 0-.12-.37.54.54 0 0 0-.437-.226h-.199c-.132 0-.225.045-.346.105l.034-.015-2.272.719c-.236.067-.457.213-.664.42a.237.237 0 0 0-.012.013c-.184.215-.31.468-.37.744v-.006l-1.84 7.36a.237.237 0 0 0 0 .006 5.949 5.949 0 0 1-.155.576.237.237 0 0 0-.008.027.665.665 0 0 1-.072.205c-.007.003-.047.026-.131.045H2.532c2.286-2.7 4.38-5.066 6.254-7.04 1.999-2.107 3.691-3.85 5.076-5.235a.237.237 0 0 0 .002-.002 508.719 508.719 0 0 1 3.199-3.239l-.004.002c.39-.377.687-.688.89-.94.205-.254.342-.42.342-.669a.534.534 0 0 0-.304-.455c-.169-.08-.366-.102-.612-.102h-.64zm11.664 1.16c-2.44 0-4.521 1.03-6.184 3.047a.237.237 0 0 0 0 .002c-.57.705-.984 1.362-1.236 1.978a.237.237 0 0 0-.004.01c-.108.297-.189.54-.244.735a1.733 1.733 0 0 0-.088.464c0 .2.029.378.13.526.103.147.289.23.465.23.181 0 .36-.078.489-.207.13-.129.22-.3.295-.508a.237.237 0 0 0 .002-.006c.12-.358.417-.895.89-1.58 1.253-1.827 2.64-2.699 4.203-2.699.919 0 1.647.381 2.252 1.188a.237.237 0 0 0 .002.002c.6.774.91 1.85.91 3.256 0 1.168-.232 2.236-.697 3.216a.237.237 0 0 0-.002.004c-.443.992-1.07 1.989-1.886 2.989a.237.237 0 0 0 0 .002c-.792.976-1.76 1.994-2.9 3.054a.237.237 0 0 0-.003.002 212.888 212.888 0 0 0-3.683 3.604c-1.644 1.643-2.876 2.97-3.706 3.988-.414.51-.728.942-.943 1.303-.214.361-.34.644-.34.918 0 .25.093.487.28.635.186.147.432.2.716.2.165 0 .63-.026 1.457-.08.844-.052 2.147-.08 3.905-.08 2.077 0 3.7.04 4.863.12 1.174.08 1.885.12 2.176.12.346 0 .618-.037.808-.228.191-.19.282-.476.418-.941a.237.237 0 0 0 .002-.002l1.121-4-.002.002c.136-.46.21-.736.21-.947 0-.196-.046-.382-.172-.52a.671.671 0 0 0-.504-.197.643.643 0 0 0-.463.215 1.43 1.43 0 0 0-.28.502.237.237 0 0 0-.004.01 2.089 2.089 0 0 1-.543.863.237.237 0 0 0-.006.008 1.636 1.636 0 0 1-.908.525l-.004.002c-.384.05-.82.076-1.312.076h-7.12c.578-.637 1.166-1.262 1.798-1.828.793-.687 1.6-1.337 2.42-1.945l.001-.002 2.555-1.836.004-.002c.881-.614 1.75-1.24 2.604-1.88a.237.237 0 0 0 .004-.003c1.482-1.158 2.594-2.35 3.334-3.582l.002-.004c.768-1.237 1.154-2.644 1.154-4.2 0-1.887-.567-3.464-1.701-4.683l-.002-.002c-1.112-1.222-2.644-1.834-4.533-1.834zm14.262.265c.22 0 .358.079.5.305a.237.237 0 0 0 .01.016c.152.207.242.509.242.925 0 .622-.152 1.481-.461 2.561a.237.237 0 0 0 0 .002c-.289 1.052-.756 2.152-1.406 3.299a.237.237 0 0 0-.002 0c-.44.779-.9 1.343-1.365 1.697-.475.36-.91.524-1.315.524-.4 0-.65-.113-.828-.338-.178-.226-.287-.6-.287-1.14 0-.508.156-1.197.478-2.046.34-.847.86-1.832 1.565-2.949l.002-.002c.636-.98 1.177-1.706 1.611-2.174.44-.473.852-.68 1.256-.68z"}},
	[])]);

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-minus',
	attrs: {"viewBox":"0 0 64 64","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M52 29H12a3 3 0 1 0 0 6h40a3 3 0 1 0 0-6z"}},
	[])]);

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-home',
	attrs: {"viewBox":"0 0 20 20","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M18.672 11H17v6c0 .445-.194 1-1 1h-4v-6H8v6H4c-.806 0-1-.555-1-1v-6H1.328c-.598 0-.47-.324-.06-.748L9.292 2.22c.195-.202.451-.302.708-.312.257.01.513.109.708.312l8.023 8.031c.411.425.539.749-.059.749z"}},
	[])]);

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-block',
	attrs: {"viewBox":"0 0 20 20","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M10 .4C4.697.4.399 4.698.399 10A9.6 9.6 0 0 0 10 19.601c5.301 0 9.6-4.298 9.6-9.601 0-5.302-4.299-9.6-9.6-9.6zM2.399 10a7.6 7.6 0 0 1 12.417-5.877L4.122 14.817A7.568 7.568 0 0 1 2.399 10zm7.6 7.599a7.56 7.56 0 0 1-4.815-1.722L15.878 5.184a7.6 7.6 0 0 1-5.879 12.415z"}},
	[])]);

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-images',
	attrs: {"viewBox":"0 0 20 20","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M17.125 6.17L15.079.535c-.151-.416-.595-.637-.989-.492L.492 5.006c-.394.144-.593.597-.441 1.013l2.156 5.941V8.777c0-1.438 1.148-2.607 2.56-2.607H8.36l4.285-3.008 2.479 3.008h2.001zM19.238 8H4.767a.761.761 0 0 0-.762.777v9.42c.001.444.343.803.762.803h14.471c.42 0 .762-.359.762-.803v-9.42A.761.761 0 0 0 19.238 8zM18 17H6v-2l1.984-4.018 2.768 3.436 2.598-2.662 3.338-1.205L18 14v3z"}},
	[])]);

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	var h = __webpack_require__(6);
	module.exports = h('svg', {key: 'svg-cog',
	attrs: {"viewBox":"0 0 20 20","class":"svg-icon"}},
	[h('path', {attrs: {"d":"M16.783 10c0-1.049.646-1.875 1.617-2.443a8.932 8.932 0 0 0-.692-1.672c-1.089.285-1.97-.141-2.711-.883-.741-.74-.968-1.621-.683-2.711a8.732 8.732 0 0 0-1.672-.691c-.568.97-1.595 1.615-2.642 1.615-1.048 0-2.074-.645-2.643-1.615a8.697 8.697 0 0 0-1.671.691c.285 1.09.059 1.971-.684 2.711-.74.742-1.621 1.168-2.711.883A8.797 8.797 0 0 0 1.6 7.557c.97.568 1.615 1.394 1.615 2.443 0 1.047-.645 2.074-1.615 2.643a8.89 8.89 0 0 0 .691 1.672c1.09-.285 1.971-.059 2.711.682.741.742.969 1.623.684 2.711a8.841 8.841 0 0 0 1.672.693c.568-.973 1.595-1.617 2.643-1.617 1.047 0 2.074.645 2.643 1.617a8.963 8.963 0 0 0 1.672-.693c-.285-1.088-.059-1.969.683-2.711.741-.74 1.622-1.166 2.711-.883a8.811 8.811 0 0 0 .692-1.672c-.973-.569-1.619-1.395-1.619-2.442zM10 13.652a3.652 3.652 0 1 1 0-7.306 3.653 3.653 0 0 1 0 7.306z"}},
	[])]);

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var h = __webpack_require__(6),
	    _ = __webpack_require__(15),
	    icons = __webpack_require__(61),
	    urls = __webpack_require__(72);
	
	
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


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var _ = __webpack_require__(15),
	    icons = __webpack_require__(61);
	
	
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


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var global = __webpack_require__(14),
	    doc = global.document,
	    _ = __webpack_require__(15);
	
	
	module.exports = function (winEvents, docEvents) {
	    var keys;
	    if (_.isDefined(winEvents)) {
	        keys = _.keys(winEvents);
	        _.map(function (evtName) {
	            global.addEventListener(evtName, winEvents[evtName], false);
	        }, keys);
	    }
	    if (_.isDefined(docEvents)) {
	        keys = _.keys(docEvents);
	        _.map(function (evtName) {
	            doc.addEventListener(evtName, docEvents[evtName], false);
	        }, keys);
	    }
	};


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var _ = __webpack_require__(15);
	
	
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


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';
	
	var h = __webpack_require__(6),
	    cuid = __webpack_require__(13),
	    Type = __webpack_require__(59),
	    _ = __webpack_require__(15);
	
	
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
	
	function view(Msg, action, model)  {
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
	    view: _.curryN(3, view)(Msg)
	};


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map