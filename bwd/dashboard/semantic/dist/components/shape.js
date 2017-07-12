/*!
 * # Semantic UI 2.2.9 - Shape
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

    $.fn.shape = function (parameters) {
        let
            $allModules = $(this),
            $body = $("body"),

            time = new Date().getTime(),
            performance = [],

            query = arguments[0],
            methodInvoked = (typeof query === "string"),
            queryArguments = [].slice.call(arguments, 1),

            requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function (callback) { setTimeout(callback, 0); },

            returnedValue
      ;

        $allModules
            .each(function () {
                let
                    moduleSelector = $allModules.selector || "",
                    settings = ($.isPlainObject(parameters))
          ? $.extend(true, {}, $.fn.shape.settings, parameters)
          : $.extend({}, $.fn.shape.settings),

        // internal aliases
                    namespace = settings.namespace,
                    selector = settings.selector,
                    error = settings.error,
                    className = settings.className,

        // define namespaces for modules
                    eventNamespace = `.${namespace}`,
                    moduleNamespace = `module-${namespace}`,

        // selector cache
                    $module = $(this),
                    $sides = $module.find(selector.sides),
                    $side = $module.find(selector.side),

        // private variables
                    nextIndex = false,
                    $activeSide,
                    $nextSide,

        // standard module
                    element = this,
                    instance = $module.data(moduleNamespace),
                    module
                    ;

                module = {

                    initialize() {
                        module.verbose("Initializing module for", element);
                        module.set.defaultSide();
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
                        module.verbose("Destroying previous module for", element);
                        $module
                            .removeData(moduleNamespace)
                            .off(eventNamespace)
          ;
                    },

                    refresh() {
                        module.verbose("Refreshing selector cache for", element);
                        $module = $(element);
                        $sides = $(this).find(selector.shape);
                        $side = $(this).find(selector.side);
                    },

                    repaint() {
                        module.verbose("Forcing repaint event");
                        let
                            shape = $sides[0] || document.createElement("div"),
                            fakeAssignment = shape.offsetWidth
                            ;
                    },

                    animate(propertyObject, callback) {
                        module.verbose("Animating box with properties", propertyObject);
                        callback = callback || function (event) {
                            module.verbose("Executing animation callback");
                            if (event !== undefined) {
                                event.stopPropagation();
                            }
                            module.reset();
                            module.set.active();
                        };
                        settings.beforeChange.call($nextSide[0]);
                        if (module.get.transitionEvent()) {
                            module.verbose("Starting CSS animation");
                            $module
                                .addClass(className.animating)
            ;
                            $sides
                                .css(propertyObject)
                                .one(module.get.transitionEvent(), callback)
            ;
                            module.set.duration(settings.duration);
                            requestAnimationFrame(() => {
                                $module
                                    .addClass(className.animating)
              ;
                                $activeSide
                                    .addClass(className.hidden)
              ;
                            });
                        } else {
                            callback();
                        }
                    },

                    queue(method) {
                        module.debug("Queueing animation of", method);
                        $sides
                            .one(module.get.transitionEvent(), () => {
                                module.debug("Executing queued animation");
                                setTimeout(() => {
                                    $module.shape(method);
                                }, 0);
                            })
          ;
                    },

                    reset() {
                        module.verbose("Animating states reset");
                        $module
                            .removeClass(className.animating)
                            .attr("style", "")
                            .removeAttr("style")
          ;
          // removeAttr style does not consistently work in safari
                        $sides
                            .attr("style", "")
                            .removeAttr("style")
          ;
                        $side
                            .attr("style", "")
                            .removeAttr("style")
                            .removeClass(className.hidden)
          ;
                        $nextSide
                            .removeClass(className.animating)
                            .attr("style", "")
                            .removeAttr("style")
          ;
                    },

                    is: {
                        complete() {
                            return ($side.filter(`.${className.active}`)[0] == $nextSide[0]);
                        },
                        animating() {
                            return $module.hasClass(className.animating);
                        },
                    },

                    set: {

                        defaultSide() {
                            $activeSide = $module.find(`.${settings.className.active}`);
                            $nextSide = ($activeSide.next(selector.side).length > 0)
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
            ;
                            nextIndex = false;
                            module.verbose("Active side set to", $activeSide);
                            module.verbose("Next side set to", $nextSide);
                        },

                        duration(duration) {
                            duration = duration || settings.duration;
                            duration = (typeof duration === "number")
              ? `${duration}ms`
              : duration
            ;
                            module.verbose("Setting animation duration", duration);
                            if (settings.duration || settings.duration === 0) {
                                $sides.add($side)
                                    .css({
                                        "-webkit-transition-duration": duration,
                                        "-moz-transition-duration": duration,
                                        "-ms-transition-duration": duration,
                                        "-o-transition-duration": duration,
                                        "transition-duration": duration,
                                    })
              ;
                            }
                        },

                        currentStageSize() {
                            let
                                $activeSide = $module.find(`.${settings.className.active}`),
                                width = $activeSide.outerWidth(true),
                                height = $activeSide.outerHeight(true)
                                ;
                            $module
                                .css({
                                    width,
                                    height,
                                })
            ;
                        },

                        stageSize() {
                            let
                                $clone = $module.clone().addClass(className.loading),
                                $activeSide = $clone.find(`.${settings.className.active}`),
                                $nextSide = (nextIndex)
                ? $clone.find(selector.side).eq(nextIndex)
                : ($activeSide.next(selector.side).length > 0)
                  ? $activeSide.next(selector.side)
                  : $clone.find(selector.side).first(),
                                newWidth = (settings.width == "next")
                ? $nextSide.outerWidth(true)
                : (settings.width == "initial")
                  ? $module.width()
                  : settings.width,
                                newHeight = (settings.height == "next")
                ? $nextSide.outerHeight(true)
                : (settings.height == "initial")
                  ? $module.height()
                  : settings.height
                  ;
                            $activeSide.removeClass(className.active);
                            $nextSide.addClass(className.active);
                            $clone.insertAfter($module);
                            $clone.remove();
                            if (settings.width != "auto") {
                                $module.css("width", newWidth + settings.jitter);
                                module.verbose("Specifying width during animation", newWidth);
                            }
                            if (settings.height != "auto") {
                                $module.css("height", newHeight + settings.jitter);
                                module.verbose("Specifying height during animation", newHeight);
                            }
                        },

                        nextSide(selector) {
                            nextIndex = selector;
                            $nextSide = $side.filter(selector);
                            nextIndex = $side.index($nextSide);
                            if ($nextSide.length === 0) {
                                module.set.defaultSide();
                                module.error(error.side);
                            }
                            module.verbose("Next side manually set to", $nextSide);
                        },

                        active() {
                            module.verbose("Setting new side to active", $nextSide);
                            $side
                                .removeClass(className.active)
            ;
                            $nextSide
                                .addClass(className.active)
            ;
                            settings.onChange.call($nextSide[0]);
                            module.set.defaultSide();
                        },
                    },

                    flip: {

                        up() {
                            if (module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
                                module.debug("Side already visible", $nextSide);
                                return;
                            }
                            if (!module.is.animating()) {
                                module.debug("Flipping up", $nextSide);
                                const
                transform = module.get.transform.up()
              ;
                                module.set.stageSize();
                                module.stage.above();
                                module.animate(transform);
                            } else {
                                module.queue("flip up");
                            }
                        },

                        down() {
                            if (module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
                                module.debug("Side already visible", $nextSide);
                                return;
                            }
                            if (!module.is.animating()) {
                                module.debug("Flipping down", $nextSide);
                                const
                transform = module.get.transform.down()
              ;
                                module.set.stageSize();
                                module.stage.below();
                                module.animate(transform);
                            } else {
                                module.queue("flip down");
                            }
                        },

                        left() {
                            if (module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
                                module.debug("Side already visible", $nextSide);
                                return;
                            }
                            if (!module.is.animating()) {
                                module.debug("Flipping left", $nextSide);
                                const
                transform = module.get.transform.left()
              ;
                                module.set.stageSize();
                                module.stage.left();
                                module.animate(transform);
                            } else {
                                module.queue("flip left");
                            }
                        },

                        right() {
                            if (module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
                                module.debug("Side already visible", $nextSide);
                                return;
                            }
                            if (!module.is.animating()) {
                                module.debug("Flipping right", $nextSide);
                                const
                transform = module.get.transform.right()
              ;
                                module.set.stageSize();
                                module.stage.right();
                                module.animate(transform);
                            } else {
                                module.queue("flip right");
                            }
                        },

                        over() {
                            if (module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
                                module.debug("Side already visible", $nextSide);
                                return;
                            }
                            if (!module.is.animating()) {
                                module.debug("Flipping over", $nextSide);
                                module.set.stageSize();
                                module.stage.behind();
                                module.animate(module.get.transform.over());
                            } else {
                                module.queue("flip over");
                            }
                        },

                        back() {
                            if (module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
                                module.debug("Side already visible", $nextSide);
                                return;
                            }
                            if (!module.is.animating()) {
                                module.debug("Flipping back", $nextSide);
                                module.set.stageSize();
                                module.stage.behind();
                                module.animate(module.get.transform.back());
                            } else {
                                module.queue("flip back");
                            }
                        },

                    },

                    get: {

                        transform: {
                            up() {
                                const
                translate = {
                    y: -(($activeSide.outerHeight(true) - $nextSide.outerHeight(true)) / 2),
                    z: -($activeSide.outerHeight(true) / 2),
                }
              ;
                                return {
                                    transform: `translateY(${translate.y}px) translateZ(${translate.z}px) rotateX(-90deg)`,
                                };
                            },

                            down() {
                                const
                translate = {
                    y: -(($activeSide.outerHeight(true) - $nextSide.outerHeight(true)) / 2),
                    z: -($activeSide.outerHeight(true) / 2),
                }
              ;
                                return {
                                    transform: `translateY(${translate.y}px) translateZ(${translate.z}px) rotateX(90deg)`,
                                };
                            },

                            left() {
                                const
                translate = {
                    x: -(($activeSide.outerWidth(true) - $nextSide.outerWidth(true)) / 2),
                    z: -($activeSide.outerWidth(true) / 2),
                }
              ;
                                return {
                                    transform: `translateX(${translate.x}px) translateZ(${translate.z}px) rotateY(90deg)`,
                                };
                            },

                            right() {
                                const
                translate = {
                    x: -(($activeSide.outerWidth(true) - $nextSide.outerWidth(true)) / 2),
                    z: -($activeSide.outerWidth(true) / 2),
                }
              ;
                                return {
                                    transform: `translateX(${translate.x}px) translateZ(${translate.z}px) rotateY(-90deg)`,
                                };
                            },

                            over() {
                                const
                translate = {
                    x: -(($activeSide.outerWidth(true) - $nextSide.outerWidth(true)) / 2),
                }
              ;
                                return {
                                    transform: `translateX(${translate.x}px) rotateY(180deg)`,
                                };
                            },

                            back() {
                                const
                translate = {
                    x: -(($activeSide.outerWidth(true) - $nextSide.outerWidth(true)) / 2),
                }
              ;
                                return {
                                    transform: `translateX(${translate.x}px) rotateY(-180deg)`,
                                };
                            },
                        },

                        transitionEvent() {
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

                        nextSide() {
                            return ($activeSide.next(selector.side).length > 0)
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
            ;
                        },

                    },

                    stage: {

                        above() {
                            const
              box = {
                  origin: (($activeSide.outerHeight(true) - $nextSide.outerHeight(true)) / 2),
                  depth: {
                      active: ($nextSide.outerHeight(true) / 2),
                      next: ($activeSide.outerHeight(true) / 2),
                  },
              }
            ;
                            module.verbose("Setting the initial animation position as above", $nextSide, box);
                            $sides
                                .css({
                                    transform: `translateZ(-${box.depth.active}px)`,
                                })
            ;
                            $activeSide
                                .css({
                                    transform: `rotateY(0deg) translateZ(${box.depth.active}px)`,
                                })
            ;
                            $nextSide
                                .addClass(className.animating)
                                .css({
                                    top: `${box.origin}px`,
                                    transform: `rotateX(90deg) translateZ(${box.depth.next}px)`,
                                })
            ;
                        },

                        below() {
                            const
              box = {
                  origin: (($activeSide.outerHeight(true) - $nextSide.outerHeight(true)) / 2),
                  depth: {
                      active: ($nextSide.outerHeight(true) / 2),
                      next: ($activeSide.outerHeight(true) / 2),
                  },
              }
            ;
                            module.verbose("Setting the initial animation position as below", $nextSide, box);
                            $sides
                                .css({
                                    transform: `translateZ(-${box.depth.active}px)`,
                                })
            ;
                            $activeSide
                                .css({
                                    transform: `rotateY(0deg) translateZ(${box.depth.active}px)`,
                                })
            ;
                            $nextSide
                                .addClass(className.animating)
                                .css({
                                    top: `${box.origin}px`,
                                    transform: `rotateX(-90deg) translateZ(${box.depth.next}px)`,
                                })
            ;
                        },

                        left() {
                            let
                                height = {
                                    active: $activeSide.outerWidth(true),
                                    next: $nextSide.outerWidth(true),
                                },
                                box = {
                                    origin: ((height.active - height.next) / 2),
                                    depth: {
                                        active: (height.next / 2),
                                        next: (height.active / 2),
                                    },
                                }
                                ;
                            module.verbose("Setting the initial animation position as left", $nextSide, box);
                            $sides
                                .css({
                                    transform: `translateZ(-${box.depth.active}px)`,
                                })
            ;
                            $activeSide
                                .css({
                                    transform: `rotateY(0deg) translateZ(${box.depth.active}px)`,
                                })
            ;
                            $nextSide
                                .addClass(className.animating)
                                .css({
                                    left: `${box.origin}px`,
                                    transform: `rotateY(-90deg) translateZ(${box.depth.next}px)`,
                                })
            ;
                        },

                        right() {
                            let
                                height = {
                                    active: $activeSide.outerWidth(true),
                                    next: $nextSide.outerWidth(true),
                                },
                                box = {
                                    origin: ((height.active - height.next) / 2),
                                    depth: {
                                        active: (height.next / 2),
                                        next: (height.active / 2),
                                    },
                                }
                                ;
                            module.verbose("Setting the initial animation position as left", $nextSide, box);
                            $sides
                                .css({
                                    transform: `translateZ(-${box.depth.active}px)`,
                                })
            ;
                            $activeSide
                                .css({
                                    transform: `rotateY(0deg) translateZ(${box.depth.active}px)`,
                                })
            ;
                            $nextSide
                                .addClass(className.animating)
                                .css({
                                    left: `${box.origin}px`,
                                    transform: `rotateY(90deg) translateZ(${box.depth.next}px)`,
                                })
            ;
                        },

                        behind() {
                            let
                                height = {
                                    active: $activeSide.outerWidth(true),
                                    next: $nextSide.outerWidth(true),
                                },
                                box = {
                                    origin: ((height.active - height.next) / 2),
                                    depth: {
                                        active: (height.next / 2),
                                        next: (height.active / 2),
                                    },
                                }
                                ;
                            module.verbose("Setting the initial animation position as behind", $nextSide, box);
                            $activeSide
                                .css({
                                    transform: "rotateY(0deg)",
                                })
            ;
                            $nextSide
                                .addClass(className.animating)
                                .css({
                                    left: `${box.origin}px`,
                                    transform: "rotateY(-180deg)",
                                })
            ;
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

    $.fn.shape.settings = {

  // module info
        name: "Shape",

  // hide all debug content
        silent: false,

  // debug content outputted to console
        debug: false,

  // verbose debug output
        verbose: false,

  // fudge factor in pixels when swapping from 2d to 3d (can be useful to correct rounding errors)
        jitter: 0,

  // performance data output
        performance: true,

  // event namespace
        namespace: "shape",

  // width during animation, can be set to 'auto', initial', 'next' or pixel amount
        width: "initial",

  // height during animation, can be set to 'auto', 'initial', 'next' or pixel amount
        height: "initial",

  // callback occurs on side change
        beforeChange() {},
        onChange() {},

  // allow animation to same side
        allowRepeats: false,

  // animation duration
        duration: false,

  // possible errors
        error: {
            side: "You tried to switch to a side that does not exist.",
            method: "The method you called is not defined",
        },

  // classnames used
        className: {
            animating: "animating",
            hidden: "hidden",
            loading: "loading",
            active: "active",
        },

  // selectors used
        selector: {
            sides: ".sides",
            side: ".side",
        },

    };
}(jQuery, window, document));
