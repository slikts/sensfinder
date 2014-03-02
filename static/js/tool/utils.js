'use strict';

function Utils() {
    this._$doc = $('html, body');
};

Utils.prototype.round = function(n, to) {
    to = to || 1000;
    return Math.round(n * to) / to;
};

Utils.prototype.scroll = function(pos, duration) {
    duration = duration || 100;
    this._$doc.stop().animate({
        scrollTop: pos
    }, duration);
};
