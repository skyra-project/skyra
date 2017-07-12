/*!
 * # Semantic UI - Progress
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

    const
  global = (typeof window !== "undefined" && window.Math == Math)
    ? window
    : (typeof self !== "undefined" && self.Math == Math)
      ? self
      : Function("return this")()
;

    $.fn.progress = function (parameters) {
        let
            $allModules = $(this),

            moduleSelector = $allModules.selector || "",

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
          ? $.extend(true, {}, $.fn.progress.settings, parameters)
          : $.extend({}, $.fn.progress.settings),

                    className = settings.className,
                    metadata = settings.metadata,
                    namespace = settings.namespace,
                    selector = settings.selector,
                    error = settings.error,

                    eventNamespace = `.${namespace}`,
                    moduleNamespace = `module-${namespace}`,

                    $module = $(this),
                    $bar = $(this).find(selector.bar),
                    $progress = $(this).find(selector.progress),
                    $label = $(this).find(selector.label),

                    element = this,
                    instance = $module.data(moduleNamespace),

                    animating = false,
                    transitionEnd,
                    module
                    ;

                module = {

                    initialize() {
                        module.debug("Initializing progress bar", settings);

                        module.set.duration();
                        module.set.transitionEvent();

                        module.read.metadata();
                        module.read.settings();

                        module.instantiate();
                    },

                    instantiate() {
                        module.verbose("Storing instance of progress", module);
                        instance = module;
                        $module
                            .data(moduleNamespace, module)
          ;
                    },
                    destroy() {
                        module.verbose("Destroying previous progress for", $module);
                        clearInterval(instance.interval);
                        module.remove.state();
                        $module.removeData(moduleNamespace);
                        instance = undefined;
                    },

                    reset() {
                        module.remove.nextValue();
                        module.update.progress(0);
                    },

                    complete() {
                        if (module.percent === undefined || module.percent < 100) {
                            module.remove.progressPoll();
                            module.set.percent(100);
                        }
                    },

                    read: {
                        metadata() {
                            const
              data = {
                  percent: $module.data(metadata.percent),
                  total: $module.data(metadata.total),
                  value: $module.data(metadata.value),
              }
            ;
                            if (data.percent) {
                                module.debug("Current percent value set from metadata", data.percent);
                                module.set.percent(data.percent);
                            }
                            if (data.total) {
                                module.debug("Total value set from metadata", data.total);
                                module.set.total(data.total);
                            }
                            if (data.value) {
                                module.debug("Current value set from metadata", data.value);
                                module.set.value(data.value);
                                module.set.progress(data.value);
                            }
                        },
                        settings() {
                            if (settings.total !== false) {
                                module.debug("Current total set in settings", settings.total);
                                module.set.total(settings.total);
                            }
                            if (settings.value !== false) {
                                module.debug("Current value set in settings", settings.value);
                                module.set.value(settings.value);
                                module.set.progress(module.value);
                            }
                            if (settings.percent !== false) {
                                module.debug("Current percent set in settings", settings.percent);
                                module.set.percent(settings.percent);
                            }
                        },
                    },

                    bind: {
                        transitionEnd(callback) {
                            const
              transitionEnd = module.get.transitionEnd()
            ;
                            $bar
                                .one(transitionEnd + eventNamespace, function (event) {
                                    clearTimeout(module.failSafeTimer);
                                    callback.call(this, event);
                                })
            ;
                            module.failSafeTimer = setTimeout(() => {
                                $bar.triggerHandler(transitionEnd);
                            }, settings.duration + settings.failSafeDelay);
                            module.verbose("Adding fail safe timer", module.timer);
                        },
                    },

                    increment(incrementValue) {
                        let
                            maxValue,
                            startValue,
                            newValue
                            ;
                        if (module.has.total()) {
                            startValue = module.get.value();
                            incrementValue = incrementValue || 1;
                            newValue = startValue + incrementValue;
                        } else {
                            startValue = module.get.percent();
                            incrementValue = incrementValue || module.get.randomValue();

                            newValue = startValue + incrementValue;
                            maxValue = 100;
                            module.debug("Incrementing percentage by", startValue, newValue);
                        }
                        newValue = module.get.normalizedValue(newValue);
                        module.set.progress(newValue);
                    },
                    decrement(decrementValue) {
                        let
                            total = module.get.total(),
                            startValue,
                            newValue
                            ;
                        if (total) {
                            startValue = module.get.value();
                            decrementValue = decrementValue || 1;
                            newValue = startValue - decrementValue;
                            module.debug("Decrementing value by", decrementValue, startValue);
                        } else {
                            startValue = module.get.percent();
                            decrementValue = decrementValue || module.get.randomValue();
                            newValue = startValue - decrementValue;
                            module.debug("Decrementing percentage by", decrementValue, startValue);
                        }
                        newValue = module.get.normalizedValue(newValue);
                        module.set.progress(newValue);
                    },

                    has: {
                        progressPoll() {
                            return module.progressPoll;
                        },
                        total() {
                            return (module.get.total() !== false);
                        },
                    },

                    get: {
                        text(templateText) {
                            let
                                value = module.value || 0,
                                total = module.total || 0,
                                percent = (animating)
                ? module.get.displayPercent()
                : module.percent || 0,
                                left = (module.total > 0)
                ? (total - value)
                : (100 - percent)
                ;
                            templateText = templateText || "";
                            templateText = templateText
              .replace("{value}", value)
              .replace("{total}", total)
              .replace("{left}", left)
              .replace("{percent}", percent)
            ;
                            module.verbose("Adding variables to progress bar text", templateText);
                            return templateText;
                        },

                        normalizedValue(value) {
                            if (value < 0) {
                                module.debug("Value cannot decrement below 0");
                                return 0;
                            }
                            if (module.has.total()) {
                                if (value > module.total) {
                                    module.debug("Value cannot increment above total", module.total);
                                    return module.total;
                                }
                            } else if (value > 100) {
                                module.debug("Value cannot increment above 100 percent");
                                return 100;
                            }
                            return value;
                        },

                        updateInterval() {
                            if (settings.updateInterval == "auto") {
                                return settings.duration;
                            }
                            return settings.updateInterval;
                        },

                        randomValue() {
                            module.debug("Generating random increment percentage");
                            return Math.floor((Math.random() * settings.random.max) + settings.random.min);
                        },

                        numericValue(value) {
                            return (typeof value === "string")
              ? (value.replace(/[^\d.]/g, "") !== "")
                ? +(value.replace(/[^\d.]/g, ""))
                : false
              : value
            ;
                        },

                        transitionEnd() {
                            let
                                element = document.createElement("element"),
                                transitions = {
                                    transition: "transitionend",
                                    OTransition: "oTransitionEnd",
                                    MozTransition: "transitionend",
                                    WebkitTransition: "webkitTransitionEnd",
                                },
                                transition
                                ;
                            for (transition in transitions) {
                                if (element.style[transition] !== undefined) {
                                    return transitions[transition];
                                }
                            }
                        },

          // gets current displayed percentage (if animating values this is the intermediary value)
                        displayPercent() {
                            let
                                barWidth = $bar.width(),
                                totalWidth = $module.width(),
                                minDisplay = parseInt($bar.css("min-width"), 10),
                                displayPercent = (barWidth > minDisplay)
                ? (barWidth / totalWidth * 100)
                : module.percent
                                ;
                            return (settings.precision > 0)
              ? Math.round(displayPercent * (10 * settings.precision)) / (10 * settings.precision)
              : Math.round(displayPercent)
            ;
                        },

                        percent() {
                            return module.percent || 0;
                        },
                        value() {
                            return module.nextValue || module.value || 0;
                        },
                        total() {
                            return module.total || false;
                        },
                    },

                    create: {
                        progressPoll() {
                            module.progressPoll = setTimeout(() => {
                                module.update.toNextValue();
                                module.remove.progressPoll();
                            }, module.get.updateInterval());
                        },
                    },

                    is: {
                        complete() {
                            return module.is.success() || module.is.warning() || module.is.error();
                        },
                        success() {
                            return $module.hasClass(className.success);
                        },
                        warning() {
                            return $module.hasClass(className.warning);
                        },
                        error() {
                            return $module.hasClass(className.error);
                        },
                        active() {
                            return $module.hasClass(className.active);
                        },
                        visible() {
                            return $module.is(":visible");
                        },
                    },

                    remove: {
                        progressPoll() {
                            module.verbose("Removing progress poll timer");
                            if (module.progressPoll) {
                                clearTimeout(module.progressPoll);
                                delete module.progressPoll;
                            }
                        },
                        nextValue() {
                            module.verbose("Removing progress value stored for next update");
                            delete module.nextValue;
                        },
                        state() {
                            module.verbose("Removing stored state");
                            delete module.total;
                            delete module.percent;
                            delete module.value;
                        },
                        active() {
                            module.verbose("Removing active state");
                            $module.removeClass(className.active);
                        },
                        success() {
                            module.verbose("Removing success state");
                            $module.removeClass(className.success);
                        },
                        warning() {
                            module.verbose("Removing warning state");
                            $module.removeClass(className.warning);
                        },
                        error() {
                            module.verbose("Removing error state");
                            $module.removeClass(className.error);
                        },
                    },

                    set: {
                        barWidth(value) {
                            if (value > 100) {
                                module.error(error.tooHigh, value);
                            } else if (value < 0) {
                                module.error(error.tooLow, value);
                            } else {
                                $bar
                                    .css("width", `${value}%`)
              ;
                                $module
                                    .attr("data-percent", parseInt(value, 10))
              ;
                            }
                        },
                        duration(duration) {
                            duration = duration || settings.duration;
                            duration = (typeof duration === "number")
              ? `${duration}ms`
              : duration
            ;
                            module.verbose("Setting progress bar transition duration", duration);
                            $bar
                                .css({
                                    "transition-duration": duration,
                                })
            ;
                        },
                        percent(percent) {
                            percent = (typeof percent === "string")
              ? +(percent.replace("%", ""))
              : percent
            ;
            // round display percentage
                            percent = (settings.precision > 0)
              ? Math.round(percent * (10 * settings.precision)) / (10 * settings.precision)
              : Math.round(percent)
            ;
                            module.percent = percent;
                            if (!module.has.total()) {
                                module.value = (settings.precision > 0)
                ? Math.round((percent / 100) * module.total * (10 * settings.precision)) / (10 * settings.precision)
                : Math.round((percent / 100) * module.total * 10) / 10
              ;
                                if (settings.limitValues) {
                                    module.value = (module.value > 100)
                  ? 100
                  : (module.value < 0)
                    ? 0
                    : module.value
                ;
                                }
                            }
                            module.set.barWidth(percent);
                            module.set.labelInterval();
                            module.set.labels();
                            settings.onChange.call(element, percent, module.value, module.total);
                        },
                        labelInterval() {
                            const
              animationCallback = function () {
                  module.verbose("Bar finished animating, removing continuous label updates");
                  clearInterval(module.interval);
                  animating = false;
                  module.set.labels();
              }
            ;
                            clearInterval(module.interval);
                            module.bind.transitionEnd(animationCallback);
                            animating = true;
                            module.interval = setInterval(() => {
                                const
                isInDOM = $.contains(document.documentElement, element)
              ;
                                if (!isInDOM) {
                                    clearInterval(module.interval);
                                    animating = false;
                                }
                                module.set.labels();
                            }, settings.framerate);
                        },
                        labels() {
                            module.verbose("Setting both bar progress and outer label text");
                            module.set.barLabel();
                            module.set.state();
                        },
                        label(text) {
                            text = text || "";
                            if (text) {
                                text = module.get.text(text);
                                module.verbose("Setting label to text", text);
                                $label.text(text);
                            }
                        },
                        state(percent) {
                            percent = (percent !== undefined)
              ? percent
              : module.percent
            ;
                            if (percent === 100) {
                                if (settings.autoSuccess && !(module.is.warning() || module.is.error() || module.is.success())) {
                                    module.set.success();
                                    module.debug("Automatically triggering success at 100%");
                                } else {
                                    module.verbose("Reached 100% removing active state");
                                    module.remove.active();
                                    module.remove.progressPoll();
                                }
                            } else if (percent > 0) {
                                module.verbose("Adjusting active progress bar label", percent);
                                module.set.active();
                            } else {
                                module.remove.active();
                                module.set.label(settings.text.active);
                            }
                        },
                        barLabel(text) {
                            if (text !== undefined) {
                                $progress.text(module.get.text(text));
                            } else if (settings.label == "ratio" && module.total) {
                                module.verbose("Adding ratio to bar label");
                                $progress.text(module.get.text(settings.text.ratio));
                            } else if (settings.label == "percent") {
                                module.verbose("Adding percentage to bar label");
                                $progress.text(module.get.text(settings.text.percent));
                            }
                        },
                        active(text) {
                            text = text || settings.text.active;
                            module.debug("Setting active state");
                            if (settings.showActivity && !module.is.active()) {
                                $module.addClass(className.active);
                            }
                            module.remove.warning();
                            module.remove.error();
                            module.remove.success();
                            text = settings.onLabelUpdate("active", text, module.value, module.total);
                            if (text) {
                                module.set.label(text);
                            }
                            module.bind.transitionEnd(() => {
                                settings.onActive.call(element, module.value, module.total);
                            });
                        },
                        success(text) {
                            text = text || settings.text.success || settings.text.active;
                            module.debug("Setting success state");
                            $module.addClass(className.success);
                            module.remove.active();
                            module.remove.warning();
                            module.remove.error();
                            module.complete();
                            if (settings.text.success) {
                                text = settings.onLabelUpdate("success", text, module.value, module.total);
                                module.set.label(text);
                            } else {
                                text = settings.onLabelUpdate("active", text, module.value, module.total);
                                module.set.label(text);
                            }
                            module.bind.transitionEnd(() => {
                                settings.onSuccess.call(element, module.total);
                            });
                        },
                        warning(text) {
                            text = text || settings.text.warning;
                            module.debug("Setting warning state");
                            $module.addClass(className.warning);
                            module.remove.active();
                            module.remove.success();
                            module.remove.error();
                            module.complete();
                            text = settings.onLabelUpdate("warning", text, module.value, module.total);
                            if (text) {
                                module.set.label(text);
                            }
                            module.bind.transitionEnd(() => {
                                settings.onWarning.call(element, module.value, module.total);
                            });
                        },
                        error(text) {
                            text = text || settings.text.error;
                            module.debug("Setting error state");
                            $module.addClass(className.error);
                            module.remove.active();
                            module.remove.success();
                            module.remove.warning();
                            module.complete();
                            text = settings.onLabelUpdate("error", text, module.value, module.total);
                            if (text) {
                                module.set.label(text);
                            }
                            module.bind.transitionEnd(() => {
                                settings.onError.call(element, module.value, module.total);
                            });
                        },
                        transitionEvent() {
                            transitionEnd = module.get.transitionEnd();
                        },
                        total(totalValue) {
                            module.total = totalValue;
                        },
                        value(value) {
                            module.value = value;
                        },
                        progress(value) {
                            if (!module.has.progressPoll()) {
                                module.debug("First update in progress update interval, immediately updating", value);
                                module.update.progress(value);
                                module.create.progressPoll();
                            } else {
                                module.debug("Updated within interval, setting next update to use new value", value);
                                module.set.nextValue(value);
                            }
                        },
                        nextValue(value) {
                            module.nextValue = value;
                        },
                    },

                    update: {
                        toNextValue() {
                            const
              nextValue = module.nextValue
            ;
                            if (nextValue) {
                                module.debug("Update interval complete using last updated value", nextValue);
                                module.update.progress(nextValue);
                                module.remove.nextValue();
                            }
                        },
                        progress(value) {
                            let
              percentComplete
            ;
                            value = module.get.numericValue(value);
                            if (value === false) {
                                module.error(error.nonNumeric, value);
                            }
                            value = module.get.normalizedValue(value);
                            if (module.has.total()) {
                                module.set.value(value);
                                percentComplete = (value / module.total) * 100;
                                module.debug("Calculating percent complete from total", percentComplete);
                                module.set.percent(percentComplete);
                            } else {
                                percentComplete = value;
                                module.debug("Setting value to exact percentage value", percentComplete);
                                module.set.percent(percentComplete);
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

    $.fn.progress.settings = {

        name: "Progress",
        namespace: "progress",

        silent: false,
        debug: false,
        verbose: false,
        performance: true,

        random: {
            min: 2,
            max: 5,
        },

        duration: 300,

        updateInterval: "auto",

        autoSuccess: true,
        showActivity: true,
        limitValues: true,

        label: "percent",
        precision: 0,
        framerate: (1000 / 30), // / 30 fps

        percent: false,
        total: false,
        value: false,

  // delay in ms for fail safe animation callback
        failSafeDelay: 100,

        onLabelUpdate(state, text, value, total) {
            return text;
        },
        onChange(percent, value, total) {},
        onSuccess(total) {},
        onActive(value, total) {},
        onError(value, total) {},
        onWarning(value, total) {},

        error: {
            method: "The method you called is not defined.",
            nonNumeric: "Progress value is non numeric",
            tooHigh: "Value specified is above 100%",
            tooLow: "Value specified is below 0%",
        },

        regExp: {
            variable: /\{\$*[A-z0-9]+\}/g,
        },

        metadata: {
            percent: "percent",
            total: "total",
            value: "value",
        },

        selector: {
            bar: "> .bar",
            label: "> .label",
            progress: ".bar > .progress",
        },

        text: {
            active: false,
            error: false,
            success: false,
            warning: false,
            percent: "{percent}%",
            ratio: "{value} of {total}",
        },

        className: {
            active: "active",
            error: "error",
            success: "success",
            warning: "warning",
        },

    };
}(jQuery, window, document));
