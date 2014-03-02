'use strict';

var Dom = function(prefix) {
    this._prefix = prefix;
    this.prefix = new RegExp('^' + prefix);
    this.add = _addEach.bind(this, this._addEl, '_$all');

    this.add($('[id^=' + prefix + ']'));
};

Dom.prototype._addEl = function(i, el) {
    var $el = $(el);
    var name = $el.attr('id').replace(this.prefix, '');
    this['$' + name] = $el;
    $el.data('name', name);
};
