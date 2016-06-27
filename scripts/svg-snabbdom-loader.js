
'use strict';

var path = require('path'),
    cheerio = require('cheerio'),
    SVGO = require('svgo'),
    R = require('ramda'),
    svgo = new SVGO({});

var omitFill = R.omit('fill');


function tagToH(tag, key) {
    var children = tag.children || [],
        nested = [],
        cnt = children.length,
        attrs,
        i;
    for (i=0; i<cnt; i+=1) {
        nested.push(tagToH(children[i]));
    }

    key = key ? 'key: \'' + key + '\',' : '';
    attrs = 'attrs: ' + JSON.stringify(omitFill(tag.attribs));
    nested = '[' + nested.join(',') + ']';

    return 'h(\'' + tag.name + '\', {' + key + attrs + '}, ' + nested + ')';
}


module.exports = function translate(content) {
    this.cacheable && this.cacheable();

    var callback = this.async(),
        key = 'svg-' + path.basename(this.resourcePath).slice(0, -4);

    var text = '\n\'use strict\';\n' + 'var h = require(\'snabbdom/h\');\n';


    svgo.optimize(content, function onOptimize(result) {
        var content = cheerio.load(result.data, {xmlMode: true});

        var $svg = content('svg'),
            viewBox = $svg.attr('viewBox');

        text += 'module.exports = ' + tagToH({name: 'svg',
                                              attribs: {viewBox: viewBox, class: 'svg-icon'},
                                              children: $svg.contents()}, key) + ';';

        callback(null, text);
    });
};

