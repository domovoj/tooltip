/*will write callbacks*/

/*plugin tooltip*/
(function($, doc) {
    var methods = {
        index: 0,
        init: function(options) {
            this.each(function() {
                var $this = $(this),
                        data = $.extend({}, $this.data('tooltip'), $this.data()),
                        set = $.extend({}, $.tooltip.dP, options, data);

                if (data.index !== undefined && set.type === 'always') {
                    set.index = data.index;
                    set.tip = data.tip;
                    set.title = options.title;
                }

                $this.data('tooltip', set);

                $this.data('defaultTriggerOn', false);
                $this.data('defaultTriggerOff', false);


                if (set.type === 'mouse')
                    $this.off('mousemove.' + $.tooltip.nS).on('mousemove.' + $.tooltip.nS, function(e) {
                        set.tip.css({
                            'left': methods._left($this, set.tip, e.pageX, set),
                            'top': methods._top($this, set.tip, e.pageY, set)
                        });
                    });
                if (set.trigger)
                    $this.off(set.trigger + '.' + $.tooltip.nS).on(set.trigger + '.' + $.tooltip.nS, function() {
                        var self = $(this),
                                set = self.data("tooltip");
                        if (!set.isShow) {
                            set.isShow = true;
                            methods._show.call(self);
                        }
                        else {
                            set.isShow = false;
                            methods.hide.call(self);
                        }
                    });
                else {
                    if (set.triggerOn)
                        $this.off(set.triggerOn + '.' + $.tooltip.nS).on(set.triggerOn + '.' + $.tooltip.nS, function() {
                            methods._show.call($(this));
                        });
                    if (set.triggerOff && set.type !== 'always')
                        $this.off(set.triggerOff + '.' + $.tooltip.nS).on(set.triggerOff + '.' + $.tooltip.nS, function() {
                            var self = $(this),
                                    set = self.data('tooltip');
                            if (set.type === 'interactive') {
                                set.tip.on('mouseenter.' + $.tooltip.nS, function() {
                                    $(this).data('hover', true).on('mouseleave.' + $.tooltip.nS, function() {
                                        methods.hide.call(self);
                                    });
                                });
                                setTimeout(function() {
                                    if (!set.tip.data('hover'))
                                        methods.hide.call(self);
                                }, 500);
                            }
                            else
                                methods.hide.call(self);
                        });
                }

                if (set.show) {
                    if (set.type === 'always')
                        methods._show.call($this);
                    else if (set.trigger)
                        $this.trigger(set.trigger + '.' + $.tooltip.nS);
                    else
                        $this.trigger(set.triggerOn + '.' + $.tooltip.nS);
                }
            });
            return this;
        },
        show: function() {
            return methods.init.call($(this), {show: true});
        },
        _show: function(update) {
            var self = this,
                    set = self.data('tooltip');

            if (!update && set.type !== 'always')
                methods.hide.call(self);

            if (set.type !== 'always' || set.index === undefined) {
                set.index = methods.index;
                methods.index++;
            }

            if (update)
                set.tip.removeAttr('class').addClass(set.tooltipClass + ' ' + set.tooltipClass + set.index);
            else if (set.type !== 'always' || !$('.' + set.tooltipClass + '.' + set.tooltipClass + set.index).length)
                set.tip = $('<div class="' + set.tooltipClass + ' ' + set.tooltipClass + set.index + '"></div>').appendTo($('body'));

            methods._setContent.call(set.tip, set.title);

            if (set.otherClass)
                set.tip.addClass(set.otherClass);

            set.tip.addClass(set.place).css({
                'left': methods._left(self, set.tip, self.offset().left, set),
                'top': methods._top(self, set.tip, self.offset().top, set)
            });
            if (!update || set.type === 'always' && !set.tip.is(':visible'))
                set.tip[set.effectIn](set.durationOn);
            return self;
        },
        hide: function() {
            return this.each(function() {
                var $this = $(this),
                        set = $this.data('tooltip');
                if (set && set.index !== undefined)
                    $('.' + set.tooltipClass + set.index).stop()[set.effectOff](set.durOff, function() {
                        $(this).remove();
                    });
            });
        },
        _update: function() {
            return methods._show.call(this, true);
        },
        set: function(prop, value) {
            var self = this,
                    set = self.data('tooltip');
            if (set) {
                set[prop] = value;
                methods._update.call(self);
            }
            return self;
        },
        get: function(prop) {
            var self = this,
                    set = self.data('tooltip');
            if (set && set[prop])
                return set[prop];
            return null;
        },
        _setContent: function(content) {
            return $(this).html(content);
        },
        _left: function(el, tooltip, left, set) {
            if (set.place === 'left')
                return Math.ceil(left - (methods._actual.call(tooltip, 'outerWidth') - set.offsetX));
            if (set.place === 'right')
                return Math.ceil(left + (set.type === 'mouse' ? 0 : el.outerWidth()) + set.offsetX);
            return Math.ceil(left - (set.type === 'mouse' ? set.offsetX : (methods._actual.call(tooltip, 'outerWidth') - el.outerWidth()) / 2));
        },
        _top: function(el, tooltip, top, set) {
            if (set.place === 'top')
                return Math.ceil(top - (methods._actual.call(tooltip, 'outerHeight') - set.offsetY));
            if (set.place === 'bottom')
                return Math.ceil(top + (set.type === 'mouse' ? 0 : el.outerHeight()) + set.offsetY);
            return Math.ceil(top - (set.type === 'mouse' ? set.offsetY : (methods._actual.call(tooltip, 'outerHeight') - el.outerHeight()) / 2));
        },
        _actual: function() {
            if (arguments.length && typeof arguments[0] === 'string') {
                var dim = arguments[0],
                        clone = this.clone();
                if (arguments[1] === undefined)
                    clone.css({
                        position: 'absolute',
                        top: '-9999px'
                    }).show().appendTo($('body')).find('*:not([style*="display:none"])').show();
                var dimS = clone[dim]();
                clone.remove();
                return dimS;
            }
            return null;
        }
    };
    $.fn.tooltip = function(method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.tooltip');
        }
    };
    $.tooltipInit = function() {
        this.nS = 'tooltip';
        this.method = function(m) {
            if (!/_/.test(m))
                return methods[m];
        };
        this.methods = function() {
            var newM = {};
            for (var i in methods) {
                if (!/_/.test(i))
                    newM[i] = methods[i];
            }
            return newM;
        };
        this.dP = {
            title: '',
            otherClass: '',
            type: '',
            effectIn: 'fadeIn',
            effectOff: 'fadeOut',
            place: 'top',
            offsetX: 0,
            offsetY: 0,
            durationOn: 300,
            durationOff: 200,
            tooltipClass: 'tooltip',
            show: false,
            trigger: '',
            triggerOn: 'mouseenter',
            triggerOff: 'mouseleave'
        };
        this.setParameters = function(options) {
            $.extend(this.dP, options);
            handleDefault();
        };
    };
    $.tooltip = new $.tooltipInit();
    function handleDefault() {
        doc.off($.tooltip.dP.triggerOn + '.' + $.tooltip.nS).on($.tooltip.dP.triggerOn + '.' + $.tooltip.nS, '[data-rel="tooltip"]', function(e) {
            if ($(this).data('defaultTriggerOn') !== false)
                methods.init.call($(this), {show: true});
        }).off($.tooltip.dP.triggerOff + '.' + $.tooltip.nS).on($.tooltip.dP.triggerOff + '.' + $.tooltip.nS, '[data-rel="tooltip"]', function(e) {
            if ($(this).data('defaultTriggerOff') !== false)
                methods.hide.call($(this));
        });
    }
    ;
    handleDefault();
})(jQuery, $(document));
/*plugin tooltip end*/