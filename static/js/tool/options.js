'use strict';


var Options = function(settings) {
    this.settings = settings;
    this.add = _addEach.bind(this, this._addEl, '$inputs');
    this._inputs = {};
    settings.subscribe('set', this._setCallback.bind(this));
};

Options.prototype._setCallback = function(key, value) {
    var inputs = this._inputs[key];
    if (!inputs) {
        return;
    }
    $.each(inputs, this._update.bind(this, key, value));
};

Options.prototype._update = function(key, value, i, input) {
    if (value === input.value()) {
        return;
    }
    input.update(value);
};

Options.prototype._addEl = function(i, el) {
    var self = this;
    var $input = $(el);
    var key = $input.attr('name');
    if (!key) {
        return;
    }
    var map = this._inputs;
    if (!map[key]) {
        map[key] = [];
    }
    var input = new OptionsInput($input);
    input.update(this.settings[key]);
    map[key].push(input);
    $input.change(function() {
        if (input.validate()) {
            self.settings[key] = input.value();
            $input.removeClass('error');
        } else {
            $input.addClass('error');
        }
    });
};

var OptionsInput = function($el) {
    this.$el = $el;
    var type = $el.attr('type');
    if (type === 'checkbox') {
        this.value = function() {
            return $el.is(':checked');
        };
        this.update = function(value) {
            $el.prop('checked', value);
        };
    } else {
        this.value = function() {
            return $el.val();
        };
        this.update = function(value) {
            $el.val(value);
        };
    }
};

OptionsInput.prototype._validators = {
    'float': /^\d+(\.\d+)?$/,
    '>0': function(value) {
        return value > 0;
    }
};

OptionsInput.prototype.validate = function() {
    var self = this;
    var valid = true;
    var validators = this.$el.data('validate');
    if (validators) {
        $.each(validators, function(i, item) {
            var value = self.value();
            var validator = self._validators[item];
            if (validator instanceof RegExp ?
                    !validator.test(value) : !validator(value)) {
                return valid = false;
            }

            return true;
        });
    }
    return valid;
};
