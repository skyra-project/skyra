/*!
 * # Semantic UI 2.2.9 - Dimmer
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

(function ($, window, document, undefined) {
    window = (typeof window !== "undefined" && window.Math == Math)
  ? window
  : (typeof self !== "undefined" && self.Math == Math)
    ? self
    : Function("return this")()
;

    $.fn.dimmer = function (parameters) {
        let
            $allModules = $(this),

            time = new Date().getTime(),
            performance = [],

            query = arguments[0],
            methodInvoked = (typeof query === "string"),
            queryArguments = [].slice.call(arguments, 1),

            returnedValue
            ;

        $allModules
            .each(function () {
                let
                    settings = ($.isPlainObject(parameters))
          ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
          : $.extend({}, $.fn.dimmer.settings),

                    selector = settings.selector,
                    namespace = settings.namespace,
                    className = settings.className,
                    error = settings.error,

                    eventNamespace = `.${namespace}`,
                    moduleNamespace = `module-${namespace}`,
                    moduleSelector = $allModules.selector || "",

                    clickEvent = ("ontouchstart" in document.documentElement)
          ? "touchstart"
          : "click",

                    $module = $(this),
                    $dimmer,
                    $dimmable,

                    element = this,
                    instance = $module.data(moduleNamespace),
                    module
                    ;

                module = {

                    preinitialize() {
                        if (module.is.dimmer()) {
                            $dimmable = $module.parent();
                            $dimmer = $module;
                        } else {
                            $dimmable = $module;
                            if (module.has.dimmer()) {
                                if (settings.dimmerName) {
                                    $dimmer = $dimmable.find(selector.dimmer).filter(`.${settings.dimmerName}`);
                                } else {
                                    $dimmer = $dimmable.find(selector.dimmer);
                                }
                            } else {
                                $dimmer = module.create();
                            }
                            module.set.variation();
                        }
                    },

                    initialize() {
                        module.debug("Initializing dimmer", settings);

                        module.bind.events();
                        module.set.dimmable();
                        module.instantiate();
                    },

                    instantiate() {
                        module.verbose("Storing instance of module", module);
                        instance = module;
                        $module
                            .data(moduleNamespace, instance)
          ;
                    },

                    destroy() {
                        module.verbose("Destroying previous module", $dimmer);
                        module.unbind.events();
                        module.remove.variation();
                        $dimmable
                            .off(eventNamespace)
          ;
                    },

                    bind: {
                        events() {
                            if (settings.on == "hover") {
                                $dimmable
                                    .on(`mouseenter${eventNamespace}`, module.show)
                                    .on(`mouseleave${eventNamespace}`, module.hide)
              ;
                            } else if (settings.on == "click") {
                                $dimmable
                                    .on(clickEvent + eventNamespace, module.toggle)
              ;
                            }
                            if (module.is.page()) {
                                module.debug("Setting as a page dimmer", $dimmable);
                                module.set.pageDimmer();
                            }

                            if (module.is.closable()) {
                                module.verbose("Adding dimmer close event", $dimmer);
                                $dimmable
                                    .on(clickEvent + eventNamespace, selector.dimmer, module.event.click)
              ;
                            }
                        },
                    },

                    unbind: {
                        events() {
                            $module
                                .removeData(moduleNamespace)
            ;
                            $dimmable
                                .off(eventNamespace)
            ;
                        },
                    },

                    event: {
                        click(event) {
                            module.verbose("Determining if event occured on dimmer", event);
                            if ($dimmer.find(event.target).length === 0 || $(event.target).is(selector.content)) {
                                module.hide();
                                event.stopImmediatePropagation();
                            }
                        },
                    },

                    addContent(element) {
                        const
            $content = $(element)
          ;
                        module.debug("Add content to dimmer", $content);
                        if ($content.parent()[0] !== $dimmer[0]) {
                            $content.detach().appendTo($dimmer);
                        }
                    },

                    create() {
                        const
            $element = $(settings.template.dimmer())
          ;
                        if (settings.dimmerName) {
                            module.debug("Creating named dimmer", settings.dimmerName);
                            $element.addClass(settings.dimmerName);
                        }
                        $element
                            .appendTo($dimmable)
          ;
                        return $element;
                    },

                    show(callback) {
                        callback = $.isFunction(callback)
            ? callback
            : function () {}
          ;
                        module.debug("Showing dimmer", $dimmer, settings);
                        if ((!module.is.dimmed() || module.is.animating()) && module.is.enabled()) {
                            module.animate.show(callback);
                            settings.onShow.call(element);
                            settings.onChange.call(element);
                        } else {
                            module.debug("Dimmer is already shown or disabled");
                        }
                    },

                    hide(callback) {
                        callback = $.isFunction(callback)
            ? callback
            : function () {}
          ;
                        if (module.is.dimmed() || module.is.animating()) {
                            module.debug("Hiding dimmer", $dimmer);
                            module.animate.hide(callback);
                            settings.onHide.call(element);
                            settings.onChange.call(element);
                        } else {
                            module.debug("Dimmer is not visible");
                        }
                    },

                    toggle() {
                        module.verbose("Toggling dimmer visibility", $dimmer);
                        if (!module.is.dimmed()) {
                            module.show();
                        } else {
                            module.hide();
                        }
                    },

                    animate: {
                        show(callback) {
                            callback = $.isFunction(callback)
              ? callback
              : function () {}
            ;
                            if (settings.useCSS && $.fn.transition !== undefined && $dimmer.transition("is supported")) {
                                if (settings.opacity !== "auto") {
                                    module.set.opacity();
                                }
                                $dimmer
                                    .transition({
                                        animation: `${settings.transition} in`,
                                        queue: false,
                                        duration: module.get.duration(),
                                        useFailSafe: true,
                                        onStart() {
                                            module.set.dimmed();
                                        },
                                        onComplete() {
                                            module.set.active();
                                            callback();
                                        },
                                    })
              ;
                            } else {
                                module.verbose("Showing dimmer animation with javascript");
                                module.set.dimmed();
                                if (settings.opacity == "auto") {
                                    settings.opacity = 0.8;
                                }
                                $dimmer
                                    .stop()
                                    .css({
                                        opacity: 0,
                                        width: "100%",
                                        height: "100%",
                                    })
                                    .fadeTo(module.get.duration(), settings.opacity, () => {
                                        $dimmer.removeAttr("style");
                                        module.set.active();
                                        callback();
                                    })
              ;
                            }
                        },
                        hide(callback) {
                            callback = $.isFunction(callback)
              ? callback
              : function () {}
            ;
                            if (settings.useCSS && $.fn.transition !== undefined && $dimmer.transition("is supported")) {
                                module.verbose("Hiding dimmer with css");
                                $dimmer
                                    .transition({
                                        animation: `${settings.transition} out`,
                                        queue: false,
                                        duration: module.get.duration(),
                                        useFailSafe: true,
                                        onStart() {
                                            module.remove.dimmed();
                                        },
                                        onComplete() {
                                            module.remove.active();
                                            callback();
                                        },
                                    })
              ;
                            } else {
                                module.verbose("Hiding dimmer with javascript");
                                module.remove.dimmed();
                                $dimmer
                                    .stop()
                                    .fadeOut(module.get.duration(), () => {
                                        module.remove.active();
                                        $dimmer.removeAttr("style");
                                        callback();
                                    })
              ;
                            }
                        },
                    },

                    get: {
                        dimmer() {
                            return $dimmer;
                        },
                        duration() {
                            if (typeof settings.duration === "object") {
                                if (module.is.active()) {
                                    return settings.duration.hide;
                                }

                                return settings.duration.show;
                            }
                            return settings.duration;
                        },
                    },

                    has: {
                        dimmer() {
                            if (settings.dimmerName) {
                                return ($module.find(selector.dimmer).filter(`.${settings.dimmerName}`).length > 0);
                            }

                            return ($module.find(selector.dimmer).length > 0);
                        },
                    },

                    is: {
                        active() {
                            return $dimmer.hasClass(className.active);
                        },
                        animating() {
                            return ($dimmer.is(":animated") || $dimmer.hasClass(className.animating));
                        },
                        closable() {
                            if (settings.closable == "auto") {
                                if (settings.on == "hover") {
                                    return false;
                                }
                                return true;
                            }
                            return settings.closable;
                        },
                        dimmer() {
                            return $module.hasClass(className.dimmer);
                        },
                        dimmable() {
                            return $module.hasClass(className.dimmable);
                        },
                        dimmed() {
                            return $dimmable.hasClass(className.dimmed);
                        },
                        disabled() {
                            return $dimmable.hasClass(className.disabled);
                        },
                        enabled() {
                            return !module.is.disabled();
                        },
                        page() {
                            return $dimmable.is("body");
                        },
                        pageDimmer() {
                            return $dimmer.hasClass(className.pageDimmer);
                        },
                    },

                    can: {
                        show() {
                            return !$dimmer.hasClass(className.disabled);
                        },
                    },

                    set: {
                        opacity(opacity) {
                            let
                                color = $dimmer.css("background-color"),
                                colorArray = color.split(","),
                                isRGB = (colorArray && colorArray.length == 3),
                                isRGBA = (colorArray && colorArray.length == 4)
                                ;
                            opacity = settings.opacity === 0 ? 0 : settings.opacity || opacity;
                            if (isRGB || isRGBA) {
                                colorArray[3] = `${opacity})`;
                                color = colorArray.join(",");
                            } else {
                                color = `rgba(0, 0, 0, ${opacity})`;
                            }
                            module.debug("Setting opacity to", opacity);
                            $dimmer.css("background-color", color);
                        },
                        active() {
                            $dimmer.addClass(className.active);
                        },
                        dimmable() {
                            $dimmable.addClass(className.dimmable);
                        },
                        dimmed() {
                            $dimmable.addClass(className.dimmed);
                        },
                        pageDimmer() {
                            $dimmer.addClass(className.pageDimmer);
                        },
                        disabled() {
                            $dimmer.addClass(className.disabled);
                        },
                        variation(variation) {
                            variation = variation || settings.variation;
                            if (variation) {
                                $dimmer.addClass(variation);
                            }
                        },
                    },

                    remove: {
                        active() {
                            $dimmer
                                .removeClass(className.active)
            ;
                        },
                        dimmed() {
                            $dimmable.removeClass(className.dimmed);
                        },
                        disabled() {
                            $dimmer.removeClass(className.disabled);
                        },
                        variation(variation) {
                            variation = variation || settings.variation;
                            if (variation) {
                                $dimmer.removeClass(variation);
                            }
                        },
                    },

                    setting(name, value) {
                        module.debug("Changing setting", name, value);
                        if ($.isPlainObject(name)) {
                            $.extend(true, settings, name);
                        } else if (value !== undefined) {
                            if ($.isPlainObject(settings[name])) {
                                $.extend(true, settings[name], value);
                            } else {
                                settings[name] = value;
                            }
                        } else {
                            return settings[name];
                        }
                    },
                    internal(name, value) {
                        if ($.isPlainObject(name)) {
                            $.extend(true, module, name);
                        } else if (value !== undefined) {
                            module[name] = value;
                        } else {
                            return module[name];
                        }
                    },
                    debug() {
                        if (!settings.silent && settings.debug) {
                            if (settings.performance) {
                                module.performance.log(arguments);
                            } else {
                                module.debug = Function.prototype.bind.call(console.info, console, `${settings.name}:`);
                                module.debug.apply(console, arguments);
                            }
                        }
                    },
                    verbose() {
                        if (!settings.silent && settings.verbose && settings.debug) {
                            if (settings.performance) {
                                module.performance.log(arguments);
                            } else {
                                module.verbose = Function.prototype.bind.call(console.info, console, `${settings.name}:`);
                                module.verbose.apply(console, arguments);
                            }
                        }
                    },
                    error() {
                        if (!settings.silent) {
                            module.error = Function.prototype.bind.call(console.error, console, `${settings.name}:`);
                            module.error.apply(console, arguments);
                        }
                    },
                    performance: {
                        log(message) {
                            let
                                currentTime,
                                executionTime,
                                previousTime
                                ;
                            if (settings.performance) {
                                currentTime = new Date().getTime();
                                previousTime = time || currentTime;
                                executionTime = currentTime - previousTime;
                                time = currentTime;
                                performance.push({
                                    Name: message[0],
                                    Arguments: [].slice.call(message, 1) || "",
                                    Element: element,
                                    "Execution Time": executionTime,
                                });
                            }
                            clearTimeout(module.performance.timer);
                            module.performance.timer = setTimeout(module.performance.display, 500);
                        },
                        display() {
                            let
                                title = `${settings.name}:`,
                                totalTime = 0
                                ;
                            time = false;
                            clearTimeout(module.performance.timer);
                            $.each(performance, (index, data) => {
                                totalTime += data["Execution Time"];
                            });
                            title += ` ${totalTime}ms`;
                            if (moduleSelector) {
                                title += ` '${moduleSelector}'`;
                            }
                            if ($allModules.length > 1) {
                                title += `${" " + "("}${$allModules.length})`;
                            }
                            if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
                                console.groupCollapsed(title);
                                if (console.table) {
                                    console.table(performance);
                                } else {
                                    $.each(performance, (index, data) => {
                                        console.log(`${data.Name}: ${data["Execution Time"]}ms`);
                                    });
                                }
                                console.groupEnd();
                            }
                            performance = [];
                        },
                    },
                    invoke(query, passedArguments, context) {
                        let
                            object = instance,
                            maxDepth,
                            found,
                            response
                            ;
                        passedArguments = passedArguments || queryArguments;
                        context = element || context;
                        if (typeof query === "string" && object !== undefined) {
                            query = query.split(/[\. ]/);
                            maxDepth = query.length - 1;
                            $.each(query, (depth, value) => {
                                const camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
                                if ($.isPlainObject(object[camelCaseValue]) && (depth != maxDepth)) {
                                    object = object[camelCaseValue];
                                } else if (object[camelCaseValue] !== undefined) {
                                    found = object[camelCaseValue];
                                    return false;
                                } else if ($.isPlainObject(object[value]) && (depth != maxDepth)) {
                                    object = object[value];
                                } else if (object[value] !== undefined) {
                                    found = object[value];
                                    return false;
                                } else {
                                    module.error(error.method, query);
                                    return false;
                                }
                            });
                        }
                        if ($.isFunction(found)) {
                            response = found.apply(context, passedArguments);
                        } else if (found !== undefined) {
                            response = found;
                        }
                        if ($.isArray(returnedValue)) {
                            returnedValue.push(response);
                        } else if (returnedValue !== undefined) {
                            returnedValue = [returnedValue, response];
                        } else if (response !== undefined) {
                            returnedValue = response;
                        }
                        return found;
                    },
                };

                module.preinitialize();

                if (methodInvoked) {
                    if (instance === undefined) {
                        module.initialize();
                    }
                    module.invoke(query);
                } else {
                    if (instance !== undefined) {
                        instance.invoke("destroy");
                    }
                    module.initialize();
                }
            })
  ;

        return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
    };

    $.fn.dimmer.settings = {

        name: "Dimmer",
        namespace: "dimmer",

        silent: false,
        debug: false,
        verbose: false,
        performance: true,

  // name to distinguish between multiple dimmers in context
        dimmerName: false,

  // whether to add a variation type
        variation: false,

  // whether to bind close events
        closable: "auto",

  // whether to use css animations
        useCSS: true,

  // css animation to use
        transition: "fade",

  // event to bind to
        on: false,

  // overriding opacity value
        opacity: "auto",

  // transition durations
        duration: {
            show: 500,
            hide: 500,
        },

        onChange() {},
        onShow() {},
        onHide() {},

        error: {
            method: "The method you called is not defined.",
        },

        className: {
            active: "active",
            animating: "animating",
            dimmable: "dimmable",
            dimmed: "dimmed",
            dimmer: "dimmer",
            disabled: "disabled",
            hide: "hide",
            pageDimmer: "page",
            show: "show",
        },

        selector: {
            dimmer: "> .ui.dimmer",
            content: ".ui.dimmer > .content, .ui.dimmer > .content > .center",
        },

        template: {
            dimmer() {
                return $("<div />").attr("class", "ui dimmer");
            },
        },

    };
}(jQuery, window, document));
