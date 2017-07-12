/*!
 * # Semantic UI 2.2.9 - Checkbox
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

    $.fn.checkbox = function (parameters) {
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
                    settings = $.extend(true, {}, $.fn.checkbox.settings, parameters),

                    className = settings.className,
                    namespace = settings.namespace,
                    selector = settings.selector,
                    error = settings.error,

                    eventNamespace = `.${namespace}`,
                    moduleNamespace = `module-${namespace}`,

                    $module = $(this),
                    $label = $(this).children(selector.label),
                    $input = $(this).children(selector.input),
                    input = $input[0],

                    initialLoad = false,
                    shortcutPressed = false,
                    instance = $module.data(moduleNamespace),

                    observer,
                    element = this,
                    module
                    ;

                module = {

                    initialize() {
                        module.verbose("Initializing checkbox", settings);

                        module.create.label();
                        module.bind.events();

                        module.set.tabbable();
                        module.hide.input();

                        module.observeChanges();
                        module.instantiate();
                        module.setup();
                    },

                    instantiate() {
                        module.verbose("Storing instance of module", module);
                        instance = module;
                        $module
                            .data(moduleNamespace, module)
          ;
                    },

                    destroy() {
                        module.verbose("Destroying module");
                        module.unbind.events();
                        module.show.input();
                        $module.removeData(moduleNamespace);
                    },

                    fix: {
                        reference() {
                            if ($module.is(selector.input)) {
                                module.debug("Behavior called on <input> adjusting invoked element");
                                $module = $module.closest(selector.checkbox);
                                module.refresh();
                            }
                        },
                    },

                    setup() {
                        module.set.initialLoad();
                        if (module.is.indeterminate()) {
                            module.debug("Initial value is indeterminate");
                            module.indeterminate();
                        } else if (module.is.checked()) {
                            module.debug("Initial value is checked");
                            module.check();
                        } else {
                            module.debug("Initial value is unchecked");
                            module.uncheck();
                        }
                        module.remove.initialLoad();
                    },

                    refresh() {
                        $label = $module.children(selector.label);
                        $input = $module.children(selector.input);
                        input = $input[0];
                    },

                    hide: {
                        input() {
                            module.verbose("Modifying <input> z-index to be unselectable");
                            $input.addClass(className.hidden);
                        },
                    },
                    show: {
                        input() {
                            module.verbose("Modifying <input> z-index to be selectable");
                            $input.removeClass(className.hidden);
                        },
                    },

                    observeChanges() {
                        if ("MutationObserver" in window) {
                            observer = new MutationObserver((mutations) => {
                                module.debug("DOM tree modified, updating selector cache");
                                module.refresh();
                            });
                            observer.observe(element, {
                                childList: true,
                                subtree: true,
                            });
                            module.debug("Setting up mutation observer", observer);
                        }
                    },

                    attachEvents(selector, event) {
                        const
            $element = $(selector)
          ;
                        event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
                        if ($element.length > 0) {
                            module.debug("Attaching checkbox events to element", selector, event);
                            $element
                                .on(`click${eventNamespace}`, event)
            ;
                        } else {
                            module.error(error.notFound);
                        }
                    },

                    event: {
                        click(event) {
                            const
              $target = $(event.target)
            ;
                            if ($target.is(selector.input)) {
                                module.verbose("Using default check action on initialized checkbox");
                                return;
                            }
                            if ($target.is(selector.link)) {
                                module.debug("Clicking link inside checkbox, skipping toggle");
                                return;
                            }
                            module.toggle();
                            $input.focus();
                            event.preventDefault();
                        },
                        keydown(event) {
                            let
                                key = event.which,
                                keyCode = {
                                    enter: 13,
                                    space: 32,
                                    escape: 27,
                                }
                                ;
                            if (key == keyCode.escape) {
                                module.verbose("Escape key pressed blurring field");
                                $input.blur();
                                shortcutPressed = true;
                            } else if (!event.ctrlKey && (key == keyCode.space || key == keyCode.enter)) {
                                module.verbose("Enter/space key pressed, toggling checkbox");
                                module.toggle();
                                shortcutPressed = true;
                            } else {
                                shortcutPressed = false;
                            }
                        },
                        keyup(event) {
                            if (shortcutPressed) {
                                event.preventDefault();
                            }
                        },
                    },

                    check() {
                        if (!module.should.allowCheck()) {
                            return;
                        }
                        module.debug("Checking checkbox", $input);
                        module.set.checked();
                        if (!module.should.ignoreCallbacks()) {
                            settings.onChecked.call(input);
                            settings.onChange.call(input);
                        }
                    },

                    uncheck() {
                        if (!module.should.allowUncheck()) {
                            return;
                        }
                        module.debug("Unchecking checkbox");
                        module.set.unchecked();
                        if (!module.should.ignoreCallbacks()) {
                            settings.onUnchecked.call(input);
                            settings.onChange.call(input);
                        }
                    },

                    indeterminate() {
                        if (module.should.allowIndeterminate()) {
                            module.debug("Checkbox is already indeterminate");
                            return;
                        }
                        module.debug("Making checkbox indeterminate");
                        module.set.indeterminate();
                        if (!module.should.ignoreCallbacks()) {
                            settings.onIndeterminate.call(input);
                            settings.onChange.call(input);
                        }
                    },

                    determinate() {
                        if (module.should.allowDeterminate()) {
                            module.debug("Checkbox is already determinate");
                            return;
                        }
                        module.debug("Making checkbox determinate");
                        module.set.determinate();
                        if (!module.should.ignoreCallbacks()) {
                            settings.onDeterminate.call(input);
                            settings.onChange.call(input);
                        }
                    },

                    enable() {
                        if (module.is.enabled()) {
                            module.debug("Checkbox is already enabled");
                            return;
                        }
                        module.debug("Enabling checkbox");
                        module.set.enabled();
                        settings.onEnable.call(input);
          // preserve legacy callbacks
                        settings.onEnabled.call(input);
                    },

                    disable() {
                        if (module.is.disabled()) {
                            module.debug("Checkbox is already disabled");
                            return;
                        }
                        module.debug("Disabling checkbox");
                        module.set.disabled();
                        settings.onDisable.call(input);
          // preserve legacy callbacks
                        settings.onDisabled.call(input);
                    },

                    get: {
                        radios() {
                            const
              name = module.get.name()
            ;
                            return $(`input[name="${name}"]`).closest(selector.checkbox);
                        },
                        otherRadios() {
                            return module.get.radios().not($module);
                        },
                        name() {
                            return $input.attr("name");
                        },
                    },

                    is: {
                        initialLoad() {
                            return initialLoad;
                        },
                        radio() {
                            return ($input.hasClass(className.radio) || $input.attr("type") == "radio");
                        },
                        indeterminate() {
                            return $input.prop("indeterminate") !== undefined && $input.prop("indeterminate");
                        },
                        checked() {
                            return $input.prop("checked") !== undefined && $input.prop("checked");
                        },
                        disabled() {
                            return $input.prop("disabled") !== undefined && $input.prop("disabled");
                        },
                        enabled() {
                            return !module.is.disabled();
                        },
                        determinate() {
                            return !module.is.indeterminate();
                        },
                        unchecked() {
                            return !module.is.checked();
                        },
                    },

                    should: {
                        allowCheck() {
                            if (module.is.determinate() && module.is.checked() && !module.should.forceCallbacks()) {
                                module.debug("Should not allow check, checkbox is already checked");
                                return false;
                            }
                            if (settings.beforeChecked.apply(input) === false) {
                                module.debug("Should not allow check, beforeChecked cancelled");
                                return false;
                            }
                            return true;
                        },
                        allowUncheck() {
                            if (module.is.determinate() && module.is.unchecked() && !module.should.forceCallbacks()) {
                                module.debug("Should not allow uncheck, checkbox is already unchecked");
                                return false;
                            }
                            if (settings.beforeUnchecked.apply(input) === false) {
                                module.debug("Should not allow uncheck, beforeUnchecked cancelled");
                                return false;
                            }
                            return true;
                        },
                        allowIndeterminate() {
                            if (module.is.indeterminate() && !module.should.forceCallbacks()) {
                                module.debug("Should not allow indeterminate, checkbox is already indeterminate");
                                return false;
                            }
                            if (settings.beforeIndeterminate.apply(input) === false) {
                                module.debug("Should not allow indeterminate, beforeIndeterminate cancelled");
                                return false;
                            }
                            return true;
                        },
                        allowDeterminate() {
                            if (module.is.determinate() && !module.should.forceCallbacks()) {
                                module.debug("Should not allow determinate, checkbox is already determinate");
                                return false;
                            }
                            if (settings.beforeDeterminate.apply(input) === false) {
                                module.debug("Should not allow determinate, beforeDeterminate cancelled");
                                return false;
                            }
                            return true;
                        },
                        forceCallbacks() {
                            return (module.is.initialLoad() && settings.fireOnInit);
                        },
                        ignoreCallbacks() {
                            return (initialLoad && !settings.fireOnInit);
                        },
                    },

                    can: {
                        change() {
                            return !($module.hasClass(className.disabled) || $module.hasClass(className.readOnly) || $input.prop("disabled") || $input.prop("readonly"));
                        },
                        uncheck() {
                            return (typeof settings.uncheckable === "boolean")
              ? settings.uncheckable
              : !module.is.radio()
            ;
                        },
                    },

                    set: {
                        initialLoad() {
                            initialLoad = true;
                        },
                        checked() {
                            module.verbose("Setting class to checked");
                            $module
                                .removeClass(className.indeterminate)
                                .addClass(className.checked)
            ;
                            if (module.is.radio()) {
                                module.uncheckOthers();
                            }
                            if (!module.is.indeterminate() && module.is.checked()) {
                                module.debug("Input is already checked, skipping input property change");
                                return;
                            }
                            module.verbose("Setting state to checked", input);
                            $input
                                .prop("indeterminate", false)
                                .prop("checked", true)
            ;
                            module.trigger.change();
                        },
                        unchecked() {
                            module.verbose("Removing checked class");
                            $module
                                .removeClass(className.indeterminate)
                                .removeClass(className.checked)
            ;
                            if (!module.is.indeterminate() && module.is.unchecked()) {
                                module.debug("Input is already unchecked");
                                return;
                            }
                            module.debug("Setting state to unchecked");
                            $input
                                .prop("indeterminate", false)
                                .prop("checked", false)
            ;
                            module.trigger.change();
                        },
                        indeterminate() {
                            module.verbose("Setting class to indeterminate");
                            $module
                                .addClass(className.indeterminate)
            ;
                            if (module.is.indeterminate()) {
                                module.debug("Input is already indeterminate, skipping input property change");
                                return;
                            }
                            module.debug("Setting state to indeterminate");
                            $input
                                .prop("indeterminate", true)
            ;
                            module.trigger.change();
                        },
                        determinate() {
                            module.verbose("Removing indeterminate class");
                            $module
                                .removeClass(className.indeterminate)
            ;
                            if (module.is.determinate()) {
                                module.debug("Input is already determinate, skipping input property change");
                                return;
                            }
                            module.debug("Setting state to determinate");
                            $input
                                .prop("indeterminate", false)
            ;
                        },
                        disabled() {
                            module.verbose("Setting class to disabled");
                            $module
                                .addClass(className.disabled)
            ;
                            if (module.is.disabled()) {
                                module.debug("Input is already disabled, skipping input property change");
                                return;
                            }
                            module.debug("Setting state to disabled");
                            $input
                                .prop("disabled", "disabled")
            ;
                            module.trigger.change();
                        },
                        enabled() {
                            module.verbose("Removing disabled class");
                            $module.removeClass(className.disabled);
                            if (module.is.enabled()) {
                                module.debug("Input is already enabled, skipping input property change");
                                return;
                            }
                            module.debug("Setting state to enabled");
                            $input
                                .prop("disabled", false)
            ;
                            module.trigger.change();
                        },
                        tabbable() {
                            module.verbose("Adding tabindex to checkbox");
                            if ($input.attr("tabindex") === undefined) {
                                $input.attr("tabindex", 0);
                            }
                        },
                    },

                    remove: {
                        initialLoad() {
                            initialLoad = false;
                        },
                    },

                    trigger: {
                        change() {
                            let
                                events = document.createEvent("HTMLEvents"),
                                inputElement = $input[0]
                                ;
                            if (inputElement) {
                                module.verbose("Triggering native change event");
                                events.initEvent("change", true, false);
                                inputElement.dispatchEvent(events);
                            }
                        },
                    },


                    create: {
                        label() {
                            if ($input.prevAll(selector.label).length > 0) {
                                $input.prev(selector.label).detach().insertAfter($input);
                                module.debug("Moving existing label", $label);
                            } else if (!module.has.label()) {
                                $label = $("<label>").insertAfter($input);
                                module.debug("Creating label", $label);
                            }
                        },
                    },

                    has: {
                        label() {
                            return ($label.length > 0);
                        },
                    },

                    bind: {
                        events() {
                            module.verbose("Attaching checkbox events");
                            $module
                                .on(`click${eventNamespace}`, module.event.click)
                                .on(`keydown${eventNamespace}`, selector.input, module.event.keydown)
                                .on(`keyup${eventNamespace}`, selector.input, module.event.keyup)
            ;
                        },
                    },

                    unbind: {
                        events() {
                            module.debug("Removing events");
                            $module
                                .off(eventNamespace)
            ;
                        },
                    },

                    uncheckOthers() {
                        const
            $radios = module.get.otherRadios()
          ;
                        module.debug("Unchecking other radios", $radios);
                        $radios.removeClass(className.checked);
                    },

                    toggle() {
                        if (!module.can.change()) {
                            if (!module.is.radio()) {
                                module.debug("Checkbox is read-only or disabled, ignoring toggle");
                            }
                            return;
                        }
                        if (module.is.indeterminate() || module.is.unchecked()) {
                            module.debug("Currently unchecked");
                            module.check();
                        } else if (module.is.checked() && module.can.uncheck()) {
                            module.debug("Currently checked");
                            module.uncheck();
                        }
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

    $.fn.checkbox.settings = {

        name: "Checkbox",
        namespace: "checkbox",

        silent: false,
        debug: false,
        verbose: true,
        performance: true,

  // delegated event context
        uncheckable: "auto",
        fireOnInit: false,

        onChange() {},

        beforeChecked() {},
        beforeUnchecked() {},
        beforeDeterminate() {},
        beforeIndeterminate() {},

        onChecked() {},
        onUnchecked() {},

        onDeterminate() {},
        onIndeterminate() {},

        onEnable() {},
        onDisable() {},

  // preserve misspelled callbacks (will be removed in 3.0)
        onEnabled() {},
        onDisabled() {},

        className: {
            checked: "checked",
            indeterminate: "indeterminate",
            disabled: "disabled",
            hidden: "hidden",
            radio: "radio",
            readOnly: "read-only",
        },

        error: {
            method: "The method you called is not defined",
        },

        selector: {
            checkbox: ".ui.checkbox",
            label: "label, .box",
            input: "input[type=\"checkbox\"], input[type=\"radio\"]",
            link: "a[href]",
        },

    };
}(jQuery, window, document));
