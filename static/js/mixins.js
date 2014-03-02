'use strict';

var ObserverMixin = {
    fireEvent: function(event, args) {
        if (ObserverMixin.debug) {
            ObserverMixin.debug(event, this, args);
        }
        var self = this;
        if (!this._callbacks || !this._callbacks[event]) {
            return;
        }
        $.each(this._callbacks[event], function(i, callback) {
            callback.apply(self, args);
        });
    },
    subscribe: function(event, callback) {
        if (!this._callbacks) {
            this._callbacks = {};
        }
        var callbacks = this._callbacks;
        if (!callbacks[event]) {
            callbacks[event] = [];
        }
        callbacks[event].push(callback);
    }
};

function _addEach(fn, allKey, $els) {
    $els.each(fn.bind(this));
    if (!this[allKey]) {
        this[allKey] = $els;
    } else {
        this[allKey] = this[allKey].add($els);
    }
}
