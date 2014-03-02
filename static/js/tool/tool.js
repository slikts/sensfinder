'use strict';

var _defaults = {
    baseSens: 2,
    downStep: 2,
    upStep: 1.5,
    switchKey: 'k',
    autoCopy: true,
    blinded: true,
    domPrefix: 'tool_',
    rootId: 'tool'
};

var Tool = function(initSettings, Settings, Storage, Dom, Options) {
    var settings = this.settings = new Settings(_defaults, initSettings, Storage);
    settings._restore();

    this.$root = $('#' + settings.rootId);

    this.dom = new Dom(settings.domPrefix);

    this.options = new Options(settings);
    this.options.add(this.$root.find('input'));
};

Tool.prototype.start = function() {

};

Tool.prototype.reset = function() {

};

Tool.prototype.restoreDefaults = function() {

};

Tool.prototype.autoFind = function() {

};

Tool.prototype.undoLast = function() {

};


var ToolTable = function() {

};





//Array.prototype.last = function() {
//    return this[this.length - 1];
//};




























(function() {
    var _Tool = {
        defaults: {
            sens: 2,
            down: 2,
            up: 1.5,
            adjust: 1,
            switch : 'k',
            autocopy: true,
            blinded: true
        },
        elemIdPrefix: 'tool_',
        results: [],
        rows: [],
        init: function(ZeroClipboard, Util) {
            var self = this;

            this.util = new Util();

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

            (new ZeroClipboard(this.$start))
                    .on('dataRequested', function(client) {
                        self.startTool();
                        self._stepCopy(client);
                    });
            (new ZeroClipboard(this.$overlay_a))
                    .on('dataRequested', function(client) {
                        console.log('addResult', 0)
                        self.addResult(0);
                        self._stepCopy(client);
                    });
//                .on('mousedown', function() {
//                    console.log('in a')
//                })
//                .on('mouseup', function() {
//                    console.log('out a')
//                });
            (new ZeroClipboard(this.$overlay_b))
                    .on('dataRequested', function(client) {
                        console.log('addResult', 1)
                        self.addResult(1);
                        self._stepCopy(client);
                    });
//                .on('mousedown', function() {
//                    console.log('in b')
//                })
//                .on('mouseup', function() {
//                    console.log('out b')
//                });
            this.$ZeroClipboard = $('#global-zeroclipboard-html-bridge');

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

            this.$autocopy.change(function() {
                self._toggleZeroClipboard($(this).is(':checked'));
            });

//        this.startTool()
            this._autoFind(1.8, 50);
        },
        _autoFind: function(x, n) {
            n = n || 25;
            var self = this;
            if (this.started) {
                this.resetTool(null, true);
            }
            this.startTool();
            var keys = ['lastLow', 'lastHigh'];
            var results = [];
            var r = this.util.round.bind(this);
            function _step() {
                var dir = (Math.abs(self.results.last()[0] - x) > Math.abs(self.results.last()[1] - x)) * 1;
                var match = self[keys[dir]];
//            console.log(, self._round(self[keys[dir]] / x), dir);
                results.push([this.util.round(match), match / x, dir]);
                console.log(r(match), '\t', r(Math.abs(1 - match / x)), '\t', r(Math.abs(match - x)));
                self.addResult(dir);
            }
            window.x = results
//        console.table(results);
            for (var i = 0; i < n; i++) {
                _step();
            }
        },
        _toggleZeroClipboard: function(on) {
            this.$ZeroClipboard[on ? 'show' : 'hide']();
        },
        _stepCopy: function(client) {
            client.setText(this.lastCommand);
            this.showNotice('Step ' + this.rows + ': Commands copied to clipboard.')
        },
        addInitialRow: function() {
            var settings = this.settings;
            if (this.rows.length) {
                this.removeTooltip(this.rows.last());
                this.rows.pop().remove();
            }
            this.addRow(settings.sens / settings.down, settings.sens * settings.up);
            this.addTooltip(this.rows.last(), 'These are the <b>Low</b> and <b>High</b>\n\
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
            $(document.body).addClass('started');
            var settings = this.settings;
            this.$start.removeClass('pulse');
            window.clearTimeout(this.pulseTimeout);

            if (settings.blinded) {
                this.$tool.addClass('blinded');
            }
        },
        resetTool: function(event, forced) {
            if (!forced && !confirm('Are you sure you want to reset the tool state?\n\n' +
                    'Current settings will be preserved.')) {
                return;
            }
            this.lastSwapped = false;
            if (this.$lastRowTooltip) {
                this.$lastRowTooltip.remove();
            }
            this.started = false;
            $(document.body).removeClass('started')
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
            this._toggleZeroClipboard(this.settings.autocopy);
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
            var last = this.results.last(),
                    lastLow = last[0],
                    lastHigh = last[1];
            var lastAvg = (lastLow + lastHigh) / 2;
            var settings = this.settings;
            var adjust = Math.pow(settings.adjust, this.results.length);
            if (dir) {
                low = lastAvg;
                high = lastHigh * settings.up * adjust;
            } else {
                low = lastLow / (settings.down * adjust);
                high = lastAvg;
            }
            this.rows.last().find('td:nth(' + dir + ')').addClass('this');
            this.addRow(low, high);
        },
        undoLastResult: function() {
            if (this.results.length === 1) {
                this.showNotice('Nothing to undo.');
                return;
            }
            this.lastSwapped = false;
            this.rows.pop().remove();
            this.rows.last().find('td').removeClass('this');
            this.results.pop();
            this.addCommands();
            this.updateOverlays();
        },
        addRow: function(low, high) {
//        this.removeTooltip(this.rows.last());
            var $row = $('<tr class="sens">')
                    .append(
                            $('<td class="a">')
                            .append(
                                    $('<span>').text(this.util.round(low))
                                    )
                            )
                    .append(
                            $('<td class="b">')
                            .append(
                                    $('<span>').text(this.util.round(high))
                                    )
                            );
            this.results.push([low, high]);
            this.rows.push($row);
            this.$table.append($row);
            this.updateOverlays();

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

            var sensA = this.results.last()[0];
            var sensB = this.results.last()[1];
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
            return;
            if (this.$lastRowTooltip) {
                this.$lastRowTooltip.remove();
            }
            var commands = this.lastCommand = this.makeCommands();
            var $input = $('<input type="text" class="commands">')
                    .val(commands)
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
            debug: true,
            activeClass: 'flash-active',
            hoverClass: 'flash-hover'
        });
        Tool.init(ZeroClipboard, Util);
    });

});