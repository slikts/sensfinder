'use strict';

var Storage = function(prefix, storage) {
    this.prefix = prefix || '';
    this.storage = storage || localStorage;
};

Storage.prototype.get = function(key) {
    return this.storage[this.prefix + key];
};

Storage.prototype.set = function(key, value) {
    this.storage[this.prefix + key] = value;
};

Storage.prototype.remove = function(key) {
    this.storage.removeItem(key);
};
