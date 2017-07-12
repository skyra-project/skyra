/*!
 * # Semantic UI 2.2.9 - State
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

    $.fn.state = function (parameters) {
        let
            $allModules = $(this),

            moduleSelector = $allModules.selector || "",

            hasTouch = ("ontouchstart" in document.documentElement),
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
          ? $.extend(true, {}, $.fn.state.settings, parameters)
          : $.extend({}, $.fn.state.settings),

                    error = settings.error,
                    metadata = settings.metadata,
                    className = settings.className,
                    namespace = settings.namespace,
                    states = settings.states,
                    text = settings.text,

                    eventNamespace = `.${namespace}`,
                    moduleNamespace = `${namespace}-module`,

                    $module = $(this),

                    element = this,
                    instance = $module.data(moduleNamespace),

                    module
                    ;
                module = {

                    initialize() {
                        module.verbose("Initializing module");

          // allow module to guess desired state based on element
                        if (settings.automatic) {
                            module.add.defaults();
                        }

          // bind events with delegated events
                        if (settings.context && moduleSelector !== "") {
                            $(settings.context)
                                .on(moduleSelector, `mouseenter${eventNamespace}`, module.change.text)
                                .on(moduleSelector, `mouseleave${eventNamespace}`, module.reset.text)
                                .on(moduleSelector, `click${eventNamespace}`, module.toggle.state)
            ;
                        } else {
                            $module
                                .on(`mouseenter${eventNamespace}`, module.change.text)
                                .on(`mouseleave${eventNamespace}`, module.reset.text)
                                .on(`click${eventNamespace}`, module.toggle.state)
            ;
                        }
                        module.instantiate();
                    },

                    instantiate() {
                        module.verbose("Storing instance of module", module);
                        instance = module;
                        $module
                            .data(moduleNamespace, module)
          ;
                    },

                    destroy() {
                        module.verbose("Destroying previous module", instance);
                        $module
                            .off(eventNamespace)
                            .removeData(moduleNamespace)
          ;
                    },

                    refresh() {
                        module.verbose("Refreshing selector cache");
                        $module = $(element);
                    },

                    add: {
                        defaults() {
                            const
              userStates = parameters && $.isPlainObject(parameters.states)
                ? parameters.states
                : {}
            ;
                            $.each(settings.defaults, (type, typeStates) => {
                                if (module.is[type] !== undefined && module.is[type]()) {
                                    module.verbose("Adding default states", type, element);
                                    $.extend(settings.states, typeStates, userStates);
                                }
                            });
                        },
                    },

                    is: {

                        active() {
                            return $module.hasClass(className.active);
                        },
                        loading() {
                            return $module.hasClass(className.loading);
                        },
                        inactive() {
                            return !($module.hasClass(className.active));
                        },
                        state(state) {
                            if (className[state] === undefined) {
                                return false;
                            }
                            return $module.hasClass(className[state]);
                        },

                        enabled() {
                            return !($module.is(settings.filter.active));
                        },
                        disabled() {
                            return ($module.is(settings.filter.active));
                        },
                        textEnabled() {
                            return !($module.is(settings.filter.text));
                        },

          // definitions for automatic type detection
                        button() {
                            return $module.is(".button:not(a, .submit)");
                        },
                        input() {
                            return $module.is("input");
                        },
                        progress() {
                            return $module.is(".ui.progress");
                        },
                    },

                    allow(state) {
                        module.debug("Now allowing state", state);
                        states[state] = true;
                    },
                    disallow(state) {
                        module.debug("No longer allowing", state);
                        states[state] = false;
                    },

                    allows(state) {
                        return states[state] || false;
                    },

                    enable() {
                        $module.removeClass(className.disabled);
                    },

                    disable() {
                        $module.addClass(className.disabled);
                    },

                    setState(state) {
                        if (module.allows(state)) {
                            $module.addClass(className[state]);
                        }
                    },

                    removeState(state) {
                        if (module.allows(state)) {
                            $module.removeClass(className[state]);
                        }
                    },

                    toggle: {
                        state() {
                            let
                                apiRequest,
                                requestCancelled
                                ;
                            if (module.allows("active") && module.is.enabled()) {
                                module.refresh();
                                if ($.fn.api !== undefined) {
                                    apiRequest = $module.api("get request");
                                    requestCancelled = $module.api("was cancelled");
                                    if (requestCancelled) {
                                        module.debug("API Request cancelled by beforesend");
                                        settings.activateTest = function () { return false; };
                                        settings.deactivateTest = function () { return false; };
                                    } else if (apiRequest) {
                                        module.listenTo(apiRequest);
                                        return;
                                    }
                                }
                                module.change.state();
                            }
                        },
                    },

                    listenTo(apiRequest) {
                        module.debug("API request detected, waiting for state signal", apiRequest);
                        if (apiRequest) {
                            if (text.loading) {
                                module.update.text(text.loading);
                            }
                            $.when(apiRequest)
                                .then(() => {
                                    if (apiRequest.state() == "resolved") {
                                        module.debug("API request succeeded");
                                        settings.activateTest = function () { return true; };
                                        settings.deactivateTest = function () { return true; };
                                    } else {
                                        module.debug("API request failed");
                                        settings.activateTest = function () { return false; };
                                        settings.deactivateTest = function () { return false; };
                                    }
                                    module.change.state();
                                })
            ;
                        }
                    },

        // checks whether active/inactive state can be given
                    change: {

                        state() {
                            module.debug("Determining state change direction");
            // inactive to active change
                            if (module.is.inactive()) {
                                module.activate();
                            } else {
                                module.deactivate();
                            }
                            if (settings.sync) {
                                module.sync();
                            }
                            settings.onChange.call(element);
                        },

                        text() {
                            if (module.is.textEnabled()) {
                                if (module.is.disabled()) {
                                    module.verbose("Changing text to disabled text", text.hover);
                                    module.update.text(text.disabled);
                                } else if (module.is.active()) {
                                    if (text.hover) {
                                        module.verbose("Changing text to hover text", text.hover);
                                        module.update.text(text.hover);
                                    } else if (text.deactivate) {
                                        module.verbose("Changing text to deactivating text", text.deactivate);
                                        module.update.text(text.deactivate);
                                    }
                                } else if (text.hover) {
                                    module.verbose("Changing text to hover text", text.hover);
                                    module.update.text(text.hover);
                                } else if (text.activate) {
                                    module.verbose("Changing text to activating text", text.activate);
                                    module.update.text(text.activate);
                                }
                            }
                        },

                    },

                    activate() {
                        if (settings.activateTest.call(element)) {
                            module.debug("Setting state to active");
                            $module
                                .addClass(className.active)
            ;
                            module.update.text(text.active);
                            settings.onActivate.call(element);
                        }
                    },

                    deactivate() {
                        if (settings.deactivateTest.call(element)) {
                            module.debug("Setting state to inactive");
                            $module
                                .removeClass(className.active)
            ;
                            module.update.text(text.inactive);
                            settings.onDeactivate.call(element);
                        }
                    },

                    sync() {
                        module.verbose("Syncing other buttons to current state");
                        if (module.is.active()) {
                            $allModules
                                .not($module)
                                .state("activate");
                        } else {
                            $allModules
                                .not($module)
                                .state("deactivate")
            ;
                        }
                    },

                    get: {
                        text() {
                            return (settings.selector.text)
              ? $module.find(settings.selector.text).text()
              : $module.html()
            ;
                        },
                        textFor(state) {
                            return text[state] || false;
                        },
                    },

                    flash: {
                        text(text, duration, callback) {
                            const
              previousText = module.get.text()
            ;
                            module.debug("Flashing text message", text, duration);
                            text = text || settings.text.flash;
                            duration = duration || settings.flashDuration;
                            callback = callback || function () {};
                            module.update.text(text);
                            setTimeout(() => {
                                module.update.text(previousText);
                                callback.call(element);
                            }, duration);
                        },
                    },

                    reset: {
          // on mouseout sets text to previous value
                        text() {
                            let
                                activeText = text.active || $module.data(metadata.storedText),
                                inactiveText = text.inactive || $module.data(metadata.storedText)
                                ;
                            if (module.is.textEnabled()) {
                                if (module.is.active() && activeText) {
                                    module.verbose("Resetting active text", activeText);
                                    module.update.text(activeText);
                                } else if (inactiveText) {
                                    module.verbose("Resetting inactive text", activeText);
                                    module.update.text(inactiveText);
                                }
                            }
                        },
                    },

                    update: {
                        text(text) {
                            const
              currentText = module.get.text()
            ;
                            if (text && text !== currentText) {
                                module.debug("Updating text", text);
                                if (settings.selector.text) {
                                    $module
                                        .data(metadata.storedText, text)
                                        .find(settings.selector.text)
                                        .text(text)
                ;
                                } else {
                                    $module
                                        .data(metadata.storedText, text)
                                        .html(text)
                ;
                                }
                            } else {
                                module.debug("Text is already set, ignoring update", text);
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

    $.fn.state.settings = {

  // module info
        name: "State",

  // debug output
        debug: false,

  // verbose debug output
        verbose: false,

  // namespace for events
        namespace: "state",

  // debug data includes performance
        performance: true,

  // callback occurs on state change
        onActivate() {},
        onDeactivate() {},
        onChange() {},

  // state test functions
        activateTest() { return true; },
        deactivateTest() { return true; },

  // whether to automatically map default states
        automatic: true,

  // activate / deactivate changes all elements instantiated at same time
        sync: false,

  // default flash text duration, used for temporarily changing text of an element
        flashDuration: 1000,

  // selector filter
        filter: {
            text: ".loading, .disabled",
            active: ".disabled",
        },

        context: false,

  // error
        error: {
            beforeSend: "The before send function has cancelled state change",
            method: "The method you called is not defined.",
        },

  // metadata
        metadata: {
            promise: "promise",
            storedText: "stored-text",
        },

  // change class on state
        className: {
            active: "active",
            disabled: "disabled",
            error: "error",
            loading: "loading",
            success: "success",
            warning: "warning",
        },

        selector: {
    // selector for text node
            text: false,
        },

        defaults: {
            input: {
                disabled: true,
                loading: true,
                active: true,
            },
            button: {
                disabled: true,
                loading: true,
                active: true,
            },
            progress: {
                active: true,
                success: true,
                warning: true,
                error: true,
            },
        },

        states: {
            active: true,
            disabled: true,
            error: true,
            loading: true,
            success: true,
            warning: true,
        },

        text: {
            disabled: false,
            flash: false,
            hover: false,
            active: false,
            inactive: false,
            activate: false,
            deactivate: false,
        },

    };
}(jQuery, window, document));
