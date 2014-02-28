'use strict';

var Tool = {
    defaults: {
        sens: 2,
        down: 2,
        up: 1.5,
        adjust: 0.95,
        switch : 'k',
        autocopy: true,
        blinded: true
    },
    elemIdPrefix: 'tool_',
    roundBy: 1000,
    init: function(ZeroClipboard) {
        var self = this;
        var defaults = this.defaults;

        this.settings = $.extend({}, defaults);
        this.$tool = $('#tool');
        var elemIdPrefixRegExp = new RegExp('^' + this.elemIdPrefix);
        $('[id^=' + this.elemIdPrefix + ']').each(function() {
            var $this = $(this);
            var key = $this.attr('id').replace(elemIdPrefixRegExp, '');
            self['$' + key] = $this;
            $this.data('key', key);
        });

        var $inputs = this.$inputs = this.$tool.find('input');

        this.$switchKbd = $('.switchkey');

        $('.has_tooltip').each(function() {
            var $this = $(this);
            self.addTooltip($this, $this.data('tooltip'));
        });

        this.$overlays = this.$overlay_a.add(this.$overlay_b);
        this.updateOverlays();
        this.$overlay_a
                .hover(function() {
                    self.$table.addClass('hover_a');
                }, function() {
                    self.$table.removeClass('hover_a');
                })
                .click(this.addResult.bind(this, 0));
        this.$overlay_b
                .hover(function() {
                    self.$table.addClass('hover_b');
                }, function() {
                    self.$table.removeClass('hover_b');
                })
                .click(this.addResult.bind(this, 1));

        this.$start.click(this.startTool.bind(this));
        this.$reset.click(this.resetTool.bind(this));
        this.$undo.click(this.undoLastResult.bind(this));
        this.$defaults.click(this.restoreDefaults.bind(this));

        $inputs.filter('[type=text]').click(function() {
            $(this).select();
        }).keypress(function(event) {
            var char = String.fromCharCode(event.which);
            if (typeof defaults[$(this).data('key')] === 'number') {
                return /[0-9.]/.test(char);
            } else {
                return /[0-9a-z_]/i.test(char);
            }
        }).keyup(function() {
            self.readSettings(true);
        });
        $inputs.filter('[type=checkbox]').change(this.readSettings.bind(this, true));

        this.$options.height(this.$options.height());

        this.restoreSettings();

        var togglePulse = function() {
            if (self.started) {
                return;
            }
            self.$start.toggleClass('pulse');
        };
        window.setInterval(function() {
            togglePulse();
            self.pulseTimeout = window.setTimeout(togglePulse, 1000);
        }, 5000);

        $(window).scroll(this.updateScroll.bind(this));
//        this.startTool();
    },
    addInitialRow: function() {
        var settings = this.settings;
        if (this.$lastRow) {
            this.removeTooltip(this.$lastRow);
            this.$lastRow.remove();
        }
        this.rows = 0;
        this.addRow(settings.sens / settings.down, settings.sens * settings.up);
        this.addTooltip(this.$lastRow, 'These are the <b>Low</b> and <b>High</b>\n\
 sensitivity settings for the initial step. After the settings have been tested,\n\
you select the setting that worked better by clicking on it and the tool\n\
continues to the next step.');
    },
    updateScroll: function() {
        var $table = this.$table;
        var $tool = this.$tool;
        var scrollTop = $(window).scrollTop();
        if ($tool.offset().top < scrollTop) {
            $tool.addClass('scrolled');
            if ($table.offset().top + $table.outerHeight() - 50 < scrollTop) {
                $tool.addClass('scrolled_over');
            } else {
                $tool.removeClass('scrolled_over');
            }
        } else {
            $tool.removeClass('scrolled_over');
            $tool.removeClass('scrolled');
        }
    },
    showTool: function() {
        var toolOffset = this.$tool.offset().top;
        if ($(window).scrollTop() > toolOffset) {
            this._scroll(0);
        }
    },
    startTool: function() {
        this.started = true;
        if (!this.readSettings()) {
            this.started = false;
            return;
        }
        this.showTool();

        this.$tool.addClass('started');
        var settings = this.settings;
        this.$start.removeClass('pulse');
        window.clearTimeout(this.pulseTimeout);

        if (settings.blinded) {
            this.$tool.addClass('blinded');
        }
    },
    resetTool: function(event, forced) {
        if (!forced && !confirm('Are you sure you want to reset the tool state?\n\
\n\
Current settings will be preserved.')) {
            return;
        }
        this.lastSwapped = false;
        if (this.$lastRowTooltip) {
            this.$lastRowTooltip.remove();
        }
        this.started = false;
        this.$tool.removeClass('started')
                .removeClass('blinded');
        this.$table.find('tr.sens').remove();
        this.addInitialRow();
        this.showNotice('Tool state reset.');
        this.showTool();
        this._updateTableWrap();
    },
    // Read settings from inputs, validate and save them
    readSettings: function(skipSave) {
        var self = this;
        var settings = this.settings;
        var defaults = this.defaults;
        var errors = false;
        $.each(settings, function(key) {
            var $input = self['$' + key];
            var type = $input.attr('type');
            var value;
            var error = false;

            if (type === 'text') {
                value = $input.val();
                if (typeof defaults[key] === 'number') {
                    value = value * 1;
                    if (isNaN(value)) {
                        error = true;
                    }
                }
                if (!value) {
                    error = true;
                }
            } else if (type === 'checkbox') {
                value = $input.is(':checked');
            }
            if (error) {
                $input.addClass('error');
                errors = true;
            } else {
                $input.removeClass('error');
            }
            settings[key] = value;
        });
        if (settings.low >= settings.high) {
            this.$low.add(this.$high).addClass('error');
            errors = true;
        }
        if (errors) {
            this.updateSettings();
            return false;
        }
        if (!skipSave) {
            this.saveSettings();
        }
        this.updateSettings();
        return true;
    },
    // Update widgets connected to settings
    updateSettings: function() {
        this.updateSwitch();
        this.updateDefaultControl();
        this.addInitialRow();
    },
    saveSettings: function() {
        var defaults = this.defaults;
        $.each(this.settings, function(key, value) {
            var defaultValue = defaults[key];
            if (value !== defaultValue) {
                if (typeof defaultValue === 'boolean') {
                    value = value * 1;
                }
                localStorage[key] = value;
            } else {
                localStorage.removeItem(key);
            }
        });
    },
    restoreSettings: function() {
        var self = this;
        var settings = this.settings;
        $.each(settings, function(key, value) {
            var storedValue = localStorage[key];
            if (typeof storedValue !== 'undefined' && storedValue !== value) {
                settings[key] = value = storedValue;
            }
            var $input = self['$' + key];
            if ($input.attr('type') === 'text') {
                $input.val(value);
            } else if ($input.attr('type') === 'checkbox') {
                $input.prop('checked', !!(value * 1));
            }
        });
        this.updateSettings();
    },
    restoreDefaults: function(event, forced) {
        if (!forced && !confirm('Are you sure you want to restore default settings?')) {
            return;
        }
        $.each(this.settings, function(key) {
            localStorage.removeItem(key);
        });
        this.settings = $.extend({}, this.defaults);
        this.restoreSettings();
        this.$tool.find('input.error').removeClass('error');
        this.showNotice('Default settings restored.')
    },
    updateSwitch: function() {
        this.$switchKbd.text(this.settings.switch);
    },
    addResult: function(dir) {
        if (this.lastSwapped) {
            dir = !dir * 1;
            this.lastSwapped = false;
        }
        var low, high;
        var lastAvg = (this.lastLow + this.lastHigh) / 2;
        var settings = this.settings;
        var adjust = Math.pow(settings.adjust, this.rows);
        if (dir) {
            low = lastAvg;
            high = this.lastHigh * settings.up * adjust;
        } else {
            low = this.lastLow / (settings.down * adjust);
            high = lastAvg;
        }
        this.$lastRow.find('td:nth(' + dir + ')').addClass('this');
        this.addRow(low, high);
    },
    undoLastResult: function() {
        if (this.rows === 1) {
            this.showNotice('Nothing to undo.')
            return;
        }
        this.lastSwapped = false;
        var $prevRow = this.$lastRow.prev();
        this.$lastRow.remove();
        this.$lastRow = $prevRow;
        this.$lastRow.find('td').removeClass('this');
        this.lastLow = $prevRow.data('low');
        this.lastHigh = $prevRow.data('high');
        this.rows -= 1;
        this.addCommands();
        this.updateOverlays();
    },
    _round: function(n) {
        return Math.round(n * this.roundBy) / this.roundBy;
    },
    addRow: function(low, high) {
        var self = this;
        if (this.$lastRow) {
            this.removeTooltip(this.$lastRow);
        }
        var $row = this.$lastRow = $('<tr class="sens">')
                .append(
                        $('<td class="a">')
                        .append(
                                $('<span>').text(this._round(low))
                                )
                        )
                .append(
                        $('<td class="b">')
                        .append(
                                $('<span>').text(this._round(high))
                                )
                        )
                .data('low', low)
                .data('high', high);
        this.lastLow = low;
        this.lastHigh = high;
        this.$table.append($row);
        this.updateOverlays();
        this.rows += 1;

        var $side = this.$side;
        var sideOffset = $side.offset().top + $side.outerHeight();
        var windowHeight = $(window).height();
        if (sideOffset > windowHeight + $(window).scrollTop()) {
            this._scroll(sideOffset - windowHeight);
        }

        if (this.started) {
            this.addCommands();
        }
    },
    makeCommands: function() {
        var _prefix = function(x) {
            return '__' + x;
        };
        var _line = 'echo ;';

        var sensA = this.lastLow;
        var sensB = this.lastHigh;
        var labelA, labelB;
        if (this.settings.blinded) {
            if (Math.random() > 0.5) {
                var _a = sensA;
                sensA = sensB;
                sensB = _a;
                this.lastSwapped = true;
            }
            labelA = 'A';
            labelB = 'B';
        } else {
            labelA = 'Low';
            labelB = 'High';
        }
        var _sens = function(alias1, alias2, msg, sens) {
            var result = [
                'alias ', _prefix(alias1), ' "clear;',
                ' echo ', 'Active setting: ', msg, ';', _line, _prefix('s'), ';', _line,
                'sensitivity ', sens, ';',
                'alias ', _prefix('tggle'), ' ', _prefix(alias2), '";'
            ];
            return result.join('');
        };
        var result = [
            'alias ', _prefix('s'), ' "echo (Step ', this.rows, ')";',
            _sens('a', 'b', labelA, this._round(sensA)),
            _sens('b', 'a', labelB, this._round(sensB)),
            'bind "', this.settings.switch, '" ', _prefix('tggle'), ';',
            _prefix('a'), ';',
        ];
        return result.join('');
    },
    _commands: 0,
    addCommands: function() {
        if (this.$lastRowTooltip) {
            this.$lastRowTooltip.remove();
        }
        var $input = $('<input type="text" class="commands">')
                .val(this.makeCommands())
                .attr('id', '_command_' + this._commands)
                .attr('readonly', true)
                .click(function() {
                    $(this).select();
                });
        var $content = $('<div>');
        var $tooltip = this.$lastRowTooltip = this.addTooltip(this.$lastRow, $content, true);
        $content.append($('<label>').attr('for', '_command_' + this._commands).text('Command: '))
                .append($input);
        $input.select();
        $tooltip.addClass('command');
        $tooltip._show();
        this._commands += 1;
    },
    _updateTableWrap: function() {
        this.$table_wrap.height(this.$table.outerHeight());
    },
    _scroll: function(x, duration) {
        duration = duration || 100;
        $('html, body').stop().animate({
            scrollTop: x
        }, duration);
    },
    _convertVal: function(val, defaultVal) {
        if (typeof defaultVal === 'number') {
            val *= 1;
        }
        return val;
    },
    updateDefaultControl: function() {
        var changed = false;
        var self = this;
        this.$inputs.each(function() {
            var $this = $(this);
            var defaultVal = self.defaults[$this.data('key')];
            var val;
            if ($this.is('[type=text]')) {
                val = self._convertVal($this.val(), self.defaults[$this.data('key')]);
            } else if ($this.is('[type=checkbox]')) {
                val = $this.is(':checked');
            }
            if (val !== defaultVal) {
                changed = true;
            }
        });
        this.$tool[(changed ? 'add' : 'remove') + 'Class']('changed');
    },
    showNotice: function(content, duration, hiding) {
        var $notice = $('<div class="notice">');
        duration = duration || 3000;
        if (typeof content === 'string') {
            content = $('<div>').html(content);
        }
        if (this.lastTimeout) {
            window.clearTimeout(this.lastTimeout);
        }

        if (this.hideLastNotice) {
            this.hideLastNotice();
        }

        $notice.append(content).appendTo(document.body);
        window.setTimeout(function() {
            $notice.addClass('show');
        }, 20);

        this.hideLastNotice = function() {
            $notice.addClass('hide');
            window.setTimeout(function() {
                $notice.remove();
            }, 250);
        };

        this.lastTimeout = window.setTimeout(this.hideLastNotice, duration);
    },
    addTooltip: function($target, content, persistent) {
        var $tooltip = $('<div class="tooltip">');
        if (!persistent) {
            $tooltip.mouseover(function() {
                var $this = $(this);
                if (!$this.hasClass('show')) {
                    $this.css('top', '-100%');
                }
            });
        }
        if (typeof content === 'string') {
            content = $('<div>').html(content);
        }
        var showTooltip = function() {
            var targetOffset = $target.offset();
            $tooltip.addClass('show').css({
                'top': targetOffset.top - ($tooltip.outerHeight() / 2 - $target.outerHeight() / 2),
                'left': targetOffset.left + $target.width() + 10
            });
        };
        var hideTooltip = function() {
            $tooltip.removeClass('show');
        };
        $tooltip._show = showTooltip;
        $tooltip._hide = hideTooltip;
        if (!persistent) {
            $target.mouseenter(showTooltip).mouseleave(hideTooltip);
        }
        $tooltip.append(content).appendTo(document.body);
        return $tooltip;
    },
    removeTooltip: function($target) {
        var $tooltip = $target.data('$tooltip');
        if ($tooltip) {
            $tooltip.remove();
        }
    },
    updateOverlays: function() {
        this.$overlays.height(this.$table.outerHeight());
        this.$overlay_a.width(this.$header_a.outerWidth());
        this.$overlay_b.width(this.$header_b.outerWidth());
        this._updateTableWrap();
    }
};

$(function() {
    ZeroClipboard.config({
        moviePath: _config['staticUrl'] + '/ZeroClipboard.swf',
        debug: true
    });
    Tool.init(ZeroClipboard);
});
