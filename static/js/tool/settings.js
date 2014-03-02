'use strict';

var Settings = function(defaults, settings, Storage) {
    var self = this;
    this._storage = new Storage();
    this._defaults = defaults;
    var _settings = $.extend({}, defaults, settings);
    $.each(defaults, function(key) {
        // Doesn't work in Opera 11
        Object.defineProperty(self, key, {
            set: function(value) {
                var defaultType = typeof defaults[key];
                if (defaultType === 'number') {
                    value = value * 1;
                } else if (defaultType === 'boolean' && typeof value === 'string') {
                    value = value === 'true';
                }
                _settings[key] = value;
                this.fireEvent('set', [key, value]);
            },
            get: function() {
                return _settings[key];
            }
        });
    });
};

$.extend(Settings.prototype, ObserverMixin);

Settings.prototype._restore = function() {
    var self = this;
    $.each(this._defaults, function(key) {
        var storedValue = self._storage.get(key);
        if (storedValue) {
            self[key] = storedValue;
        }
    });
};

Settings.prototype._save = function() {
    var storage = this._storage;
    $.each(this._defaults, function(key, defaultValue) {
        var currentValue = this[key];
        if (currentValue === defaultValue) {
            storage.remove(key);

            return;
        }
        storage.set(key, currentValue);
    });
};

Settings.prototype._reset = function() {
    $.each(this._defaults, this._storage.remove.bind(this._storage));
    $.extend(this, this._defaults);
};
