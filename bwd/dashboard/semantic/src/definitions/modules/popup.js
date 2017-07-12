/*!
 * # Semantic UI - Popup
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

    $.fn.popup = function (parameters) {
        let
            $allModules = $(this),
            $document = $(document),
            $window = $(window),
            $body = $("body"),

            moduleSelector = $allModules.selector || "",

            hasTouch = (true),
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
          ? $.extend(true, {}, $.fn.popup.settings, parameters)
          : $.extend({}, $.fn.popup.settings),

                    selector = settings.selector,
                    className = settings.className,
                    error = settings.error,
                    metadata = settings.metadata,
                    namespace = settings.namespace,

                    eventNamespace = `.${settings.namespace}`,
                    moduleNamespace = `module-${namespace}`,

                    $module = $(this),
                    $context = $(settings.context),
                    $scrollContext = $(settings.scrollContext),
                    $boundary = $(settings.boundary),
                    $target = (settings.target)
          ? $(settings.target)
          : $module,

                    $popup,
                    $offsetParent,

                    searchDepth = 0,
                    triedPositions = false,
                    openedWithTouch = false,

                    element = this,
                    instance = $module.data(moduleNamespace),

                    documentObserver,
                    elementNamespace,
                    id,
                    module
                    ;

                module = {

        // binds events
                    initialize() {
                        module.debug("Initializing", $module);
                        module.createID();
                        module.bind.events();
                        if (!module.exists() && settings.preserve) {
                            module.create();
                        }
                        if (settings.observeChanges) {
                            module.observeChanges();
                        }
                        module.instantiate();
                    },

                    instantiate() {
                        module.verbose("Storing instance", module);
                        instance = module;
                        $module
                            .data(moduleNamespace, instance)
          ;
                    },

                    observeChanges() {
                        if ("MutationObserver" in window) {
                            documentObserver = new MutationObserver(module.event.documentChanged);
                            documentObserver.observe(document, {
                                childList: true,
                                subtree: true,
                            });
                            module.debug("Setting up mutation observer", documentObserver);
                        }
                    },

                    refresh() {
                        if (settings.popup) {
                            $popup = $(settings.popup).eq(0);
                        } else if (settings.inline) {
                            $popup = $target.nextAll(selector.popup).eq(0);
                            settings.popup = $popup;
                        }
                        if (settings.popup) {
                            $popup.addClass(className.loading);
                            $offsetParent = module.get.offsetParent();
                            $popup.removeClass(className.loading);
                            if (settings.movePopup && module.has.popup() && module.get.offsetParent($popup)[0] !== $offsetParent[0]) {
                                module.debug("Moving popup to the same offset parent as activating element");
                                $popup
                                    .detach()
                                    .appendTo($offsetParent)
              ;
                            }
                        } else {
                            $offsetParent = (settings.inline)
              ? module.get.offsetParent($target)
              : module.has.popup()
                ? module.get.offsetParent($popup)
                : $body
            ;
                        }
                        if ($offsetParent.is("html") && $offsetParent[0] !== $body[0]) {
                            module.debug("Setting page as offset parent");
                            $offsetParent = $body;
                        }
                        if (module.get.variation()) {
                            module.set.variation();
                        }
                    },

                    reposition() {
                        module.refresh();
                        module.set.position();
                    },

                    destroy() {
                        module.debug("Destroying previous module");
                        if (documentObserver) {
                            documentObserver.disconnect();
                        }
          // remove element only if was created dynamically
                        if ($popup && !settings.preserve) {
                            module.removePopup();
                        }
          // clear all timeouts
                        clearTimeout(module.hideTimer);
                        clearTimeout(module.showTimer);
          // remove events
                        module.unbind.close();
                        module.unbind.events();
                        $module
                            .removeData(moduleNamespace)
          ;
                    },

                    event: {
                        start(event) {
                            const
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.show
                : settings.delay
            ;
                            clearTimeout(module.hideTimer);
                            if (!openedWithTouch) {
                                module.showTimer = setTimeout(module.show, delay);
                            }
                        },
                        end() {
                            const
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.hide
                : settings.delay
            ;
                            clearTimeout(module.showTimer);
                            module.hideTimer = setTimeout(module.hide, delay);
                        },
                        touchstart(event) {
                            openedWithTouch = true;
                            module.show();
                        },
                        resize() {
                            if (module.is.visible()) {
                                module.set.position();
                            }
                        },
                        documentChanged(mutations) {
                            [].forEach.call(mutations, (mutation) => {
                                if (mutation.removedNodes) {
                                    [].forEach.call(mutation.removedNodes, (node) => {
                                        if (node == element || $(node).find(element).length > 0) {
                                            module.debug("Element removed from DOM, tearing down events");
                                            module.destroy();
                                        }
                                    });
                                }
                            });
                        },
                        hideGracefully(event) {
                            let
                                $target = $(event.target),
                                isInDOM = $.contains(document.documentElement, event.target),
                                inPopup = ($target.closest(selector.popup).length > 0)
                                ;
            // don't close on clicks inside popup
                            if (event && !inPopup && isInDOM) {
                                module.debug("Click occurred outside popup hiding popup");
                                module.hide();
                            } else {
                                module.debug("Click was inside popup, keeping popup open");
                            }
                        },
                    },

        // generates popup html from metadata
                    create() {
                        let
                            html = module.get.html(),
                            title = module.get.title(),
                            content = module.get.content()
                            ;

                        if (html || content || title) {
                            module.debug("Creating pop-up html");
                            if (!html) {
                                html = settings.templates.popup({
                                    title,
                                    content,
                                });
                            }
                            $popup = $("<div/>")
              .addClass(className.popup)
              .data(metadata.activator, $module)
              .html(html)
            ;
                            if (settings.inline) {
                                module.verbose("Inserting popup element inline", $popup);
                                $popup
                                    .insertAfter($module)
              ;
                            } else {
                                module.verbose("Appending popup element to body", $popup);
                                $popup
                                    .appendTo($context)
              ;
                            }
                            module.refresh();
                            module.set.variation();

                            if (settings.hoverable) {
                                module.bind.popup();
                            }
                            settings.onCreate.call($popup, element);
                        } else if ($target.next(selector.popup).length !== 0) {
                            module.verbose("Pre-existing popup found");
                            settings.inline = true;
                            settings.popup = $target.next(selector.popup).data(metadata.activator, $module);
                            module.refresh();
                            if (settings.hoverable) {
                                module.bind.popup();
                            }
                        } else if (settings.popup) {
                            $(settings.popup).data(metadata.activator, $module);
                            module.verbose("Used popup specified in settings");
                            module.refresh();
                            if (settings.hoverable) {
                                module.bind.popup();
                            }
                        } else {
                            module.debug("No content specified skipping display", element);
                        }
                    },

                    createID() {
                        id = (`${Math.random().toString(16)}000000000`).substr(2, 8);
                        elementNamespace = `.${id}`;
                        module.verbose("Creating unique id for element", id);
                    },

        // determines popup state
                    toggle() {
                        module.debug("Toggling pop-up");
                        if (module.is.hidden()) {
                            module.debug("Popup is hidden, showing pop-up");
                            module.unbind.close();
                            module.show();
                        } else {
                            module.debug("Popup is visible, hiding pop-up");
                            module.hide();
                        }
                    },

                    show(callback) {
                        callback = callback || function () {};
                        module.debug("Showing pop-up", settings.transition);
                        if (module.is.hidden() && !(module.is.active() && module.is.dropdown())) {
                            if (!module.exists()) {
                                module.create();
                            }
                            if (settings.onShow.call($popup, element) === false) {
                                module.debug("onShow callback returned false, cancelling popup animation");
                                return;
                            } else if (!settings.preserve && !settings.popup) {
                                module.refresh();
                            }
                            if ($popup && module.set.position()) {
                                module.save.conditions();
                                if (settings.exclusive) {
                                    module.hideAll();
                                }
                                module.animate.show(callback);
                            }
                        }
                    },


                    hide(callback) {
                        callback = callback || function () {};
                        if (module.is.visible() || module.is.animating()) {
                            if (settings.onHide.call($popup, element) === false) {
                                module.debug("onHide callback returned false, cancelling popup animation");
                                return;
                            }
                            module.remove.visible();
                            module.unbind.close();
                            module.restore.conditions();
                            module.animate.hide(callback);
                        }
                    },

                    hideAll() {
                        $(selector.popup)
                            .filter(`.${className.visible}`)
                            .each(function () {
                                $(this)
                                    .data(metadata.activator)
                                    .popup("hide")
              ;
                            })
          ;
                    },
                    exists() {
                        if (!$popup) {
                            return false;
                        }
                        if (settings.inline || settings.popup) {
                            return (module.has.popup());
                        }

                        return ($popup.closest($context).length >= 1)
            ;
                    },

                    removePopup() {
                        if (module.has.popup() && !settings.popup) {
                            module.debug("Removing popup", $popup);
                            $popup.remove();
                            $popup = undefined;
                            settings.onRemove.call($popup, element);
                        }
                    },

                    save: {
                        conditions() {
                            module.cache = {
                                title: $module.attr("title"),
                            };
                            if (module.cache.title) {
                                $module.removeAttr("title");
                            }
                            module.verbose("Saving original attributes", module.cache.title);
                        },
                    },
                    restore: {
                        conditions() {
                            if (module.cache && module.cache.title) {
                                $module.attr("title", module.cache.title);
                                module.verbose("Restoring original attributes", module.cache.title);
                            }
                            return true;
                        },
                    },
                    supports: {
                        svg() {
                            return (typeof SVGGraphicsElement === undefined);
                        },
                    },
                    animate: {
                        show(callback) {
                            callback = $.isFunction(callback) ? callback : function () {};
                            if (settings.transition && $.fn.transition !== undefined && $module.transition("is supported")) {
                                module.set.visible();
                                $popup
                                    .transition({
                                        animation: `${settings.transition} in`,
                                        queue: false,
                                        debug: settings.debug,
                                        verbose: settings.verbose,
                                        duration: settings.duration,
                                        onComplete() {
                                            module.bind.close();
                                            callback.call($popup, element);
                                            settings.onVisible.call($popup, element);
                                        },
                                    })
              ;
                            } else {
                                module.error(error.noTransition);
                            }
                        },
                        hide(callback) {
                            callback = $.isFunction(callback) ? callback : function () {};
                            module.debug("Hiding pop-up");
                            if (settings.onHide.call($popup, element) === false) {
                                module.debug("onHide callback returned false, cancelling popup animation");
                                return;
                            }
                            if (settings.transition && $.fn.transition !== undefined && $module.transition("is supported")) {
                                $popup
                                    .transition({
                                        animation: `${settings.transition} out`,
                                        queue: false,
                                        duration: settings.duration,
                                        debug: settings.debug,
                                        verbose: settings.verbose,
                                        onComplete() {
                                            module.reset();
                                            callback.call($popup, element);
                                            settings.onHidden.call($popup, element);
                                        },
                                    })
              ;
                            } else {
                                module.error(error.noTransition);
                            }
                        },
                    },

                    change: {
                        content(html) {
                            $popup.html(html);
                        },
                    },

                    get: {
                        html() {
                            $module.removeData(metadata.html);
                            return $module.data(metadata.html) || settings.html;
                        },
                        title() {
                            $module.removeData(metadata.title);
                            return $module.data(metadata.title) || settings.title;
                        },
                        content() {
                            $module.removeData(metadata.content);
                            return $module.data(metadata.content) || $module.attr("title") || settings.content;
                        },
                        variation() {
                            $module.removeData(metadata.variation);
                            return $module.data(metadata.variation) || settings.variation;
                        },
                        popup() {
                            return $popup;
                        },
                        popupOffset() {
                            return $popup.offset();
                        },
                        calculations() {
                            let
                                targetElement = $target[0],
                                isWindow = ($boundary[0] == window),
                                targetPosition = (settings.inline || (settings.popup && settings.movePopup))
                ? $target.position()
                : $target.offset(),
                                screenPosition = (isWindow)
                ? { top: 0, left: 0 }
                : $boundary.offset(),
                                calculations = {},
                                scroll = (isWindow)
                ? { top: $window.scrollTop(), left: $window.scrollLeft() }
                : { top: 0, left: 0 },
                                screen
                ;
                            calculations = {
              // element which is launching popup
                                target: {
                                    element: $target[0],
                                    width: $target.outerWidth(),
                                    height: $target.outerHeight(),
                                    top: targetPosition.top,
                                    left: targetPosition.left,
                                    margin: {},
                                },
              // popup itself
                                popup: {
                                    width: $popup.outerWidth(),
                                    height: $popup.outerHeight(),
                                },
              // offset container (or 3d context)
                                parent: {
                                    width: $offsetParent.outerWidth(),
                                    height: $offsetParent.outerHeight(),
                                },
              // screen boundaries
                                screen: {
                                    top: screenPosition.top,
                                    left: screenPosition.left,
                                    scroll: {
                                        top: scroll.top,
                                        left: scroll.left,
                                    },
                                    width: $boundary.width(),
                                    height: $boundary.height(),
                                },
                            };

            // add in container calcs if fluid
                            if (settings.setFluidWidth && module.is.fluid()) {
                                calculations.container = {
                                    width: $popup.parent().outerWidth(),
                                };
                                calculations.popup.width = calculations.container.width;
                            }

            // add in margins if inline
                            calculations.target.margin.top = (settings.inline)
              ? parseInt(window.getComputedStyle(targetElement).getPropertyValue("margin-top"), 10)
              : 0
            ;
                            calculations.target.margin.left = (settings.inline)
              ? module.is.rtl()
                ? parseInt(window.getComputedStyle(targetElement).getPropertyValue("margin-right"), 10)
                : parseInt(window.getComputedStyle(targetElement).getPropertyValue("margin-left"), 10)
              : 0
            ;
            // calculate screen boundaries
                            screen = calculations.screen;
                            calculations.boundary = {
                                top: screen.top + screen.scroll.top,
                                bottom: screen.top + screen.scroll.top + screen.height,
                                left: screen.left + screen.scroll.left,
                                right: screen.left + screen.scroll.left + screen.width,
                            };
                            return calculations;
                        },
                        id() {
                            return id;
                        },
                        startEvent() {
                            if (settings.on == "hover") {
                                return "mouseenter";
                            } else if (settings.on == "focus") {
                                return "focus";
                            }
                            return false;
                        },
                        scrollEvent() {
                            return "scroll";
                        },
                        endEvent() {
                            if (settings.on == "hover") {
                                return "mouseleave";
                            } else if (settings.on == "focus") {
                                return "blur";
                            }
                            return false;
                        },
                        distanceFromBoundary(offset, calculations) {
                            let
                                distanceFromBoundary = {},
                                popup,
                                boundary
                                ;
                            calculations = calculations || module.get.calculations();

            // shorthand
                            popup = calculations.popup;
                            boundary = calculations.boundary;

                            if (offset) {
                                distanceFromBoundary = {
                                    top: (offset.top - boundary.top),
                                    left: (offset.left - boundary.left),
                                    right: (boundary.right - (offset.left + popup.width)),
                                    bottom: (boundary.bottom - (offset.top + popup.height)),
                                };
                                module.verbose("Distance from boundaries determined", offset, distanceFromBoundary);
                            }
                            return distanceFromBoundary;
                        },
                        offsetParent($target) {
                            let
                                element = ($target !== undefined)
                ? $target[0]
                : $module[0],
                                parentNode = element.parentNode,
                                $node = $(parentNode)
                                ;
                            if (parentNode) {
                                let
                                    is2D = ($node.css("transform") === "none"),
                                    isStatic = ($node.css("position") === "static"),
                                    isHTML = $node.is("html")
                                    ;
                                while (parentNode && !isHTML && isStatic && is2D) {
                                    parentNode = parentNode.parentNode;
                                    $node = $(parentNode);
                                    is2D = ($node.css("transform") === "none");
                                    isStatic = ($node.css("position") === "static");
                                    isHTML = $node.is("html");
                                }
                            }
                            return ($node && $node.length > 0)
              ? $node
              : $()
            ;
                        },
                        positions() {
                            return {
                                "top left": false,
                                "top center": false,
                                "top right": false,
                                "bottom left": false,
                                "bottom center": false,
                                "bottom right": false,
                                "left center": false,
                                "right center": false,
                            };
                        },
                        nextPosition(position) {
                            let
                                positions = position.split(" "),
                                verticalPosition = positions[0],
                                horizontalPosition = positions[1],
                                opposite = {
                                    top: "bottom",
                                    bottom: "top",
                                    left: "right",
                                    right: "left",
                                },
                                adjacent = {
                                    left: "center",
                                    center: "right",
                                    right: "left",
                                },
                                backup = {
                                    "top left": "top center",
                                    "top center": "top right",
                                    "top right": "right center",
                                    "right center": "bottom right",
                                    "bottom right": "bottom center",
                                    "bottom center": "bottom left",
                                    "bottom left": "left center",
                                    "left center": "top left",
                                },
                                adjacentsAvailable = (verticalPosition == "top" || verticalPosition == "bottom"),
                                oppositeTried = false,
                                adjacentTried = false,
                                nextPosition = false
                                ;
                            if (!triedPositions) {
                                module.verbose("All available positions available");
                                triedPositions = module.get.positions();
                            }

                            module.debug("Recording last position tried", position);
                            triedPositions[position] = true;

                            if (settings.prefer === "opposite") {
                                nextPosition = [opposite[verticalPosition], horizontalPosition];
                                nextPosition = nextPosition.join(" ");
                                oppositeTried = (triedPositions[nextPosition] === true);
                                module.debug("Trying opposite strategy", nextPosition);
                            }
                            if ((settings.prefer === "adjacent") && adjacentsAvailable) {
                                nextPosition = [verticalPosition, adjacent[horizontalPosition]];
                                nextPosition = nextPosition.join(" ");
                                adjacentTried = (triedPositions[nextPosition] === true);
                                module.debug("Trying adjacent strategy", nextPosition);
                            }
                            if (adjacentTried || oppositeTried) {
                                module.debug("Using backup position", nextPosition);
                                nextPosition = backup[position];
                            }
                            return nextPosition;
                        },
                    },

                    set: {
                        position(position, calculations) {
            // exit conditions
                            if ($target.length === 0 || $popup.length === 0) {
                                module.error(error.notFound);
                                return;
                            }
                            let
                                offset,
                                distanceAway,
                                target,
                                popup,
                                parent,
                                positioning,
                                popupOffset,
                                distanceFromBoundary
                                ;

                            calculations = calculations || module.get.calculations();
                            position = position || $module.data(metadata.position) || settings.position;

                            offset = $module.data(metadata.offset) || settings.offset;
                            distanceAway = settings.distanceAway;

            // shorthand
                            target = calculations.target;
                            popup = calculations.popup;
                            parent = calculations.parent;

                            if (target.width === 0 && target.height === 0 && !module.is.svg(target.element)) {
                                module.debug("Popup target is hidden, no action taken");
                                return false;
                            }

                            if (settings.inline) {
                                module.debug("Adding margin to calculation", target.margin);
                                if (position == "left center" || position == "right center") {
                                    offset += target.margin.top;
                                    distanceAway += -target.margin.left;
                                } else if (position == "top left" || position == "top center" || position == "top right") {
                                    offset += target.margin.left;
                                    distanceAway -= target.margin.top;
                                } else {
                                    offset += target.margin.left;
                                    distanceAway += target.margin.top;
                                }
                            }

                            module.debug("Determining popup position from calculations", position, calculations);

                            if (module.is.rtl()) {
                                position = position.replace(/left|right/g, match => (match == "left")
                  ? "right"
                  : "left");
                                module.debug("RTL: Popup position updated", position);
                            }

            // if last attempt use specified last resort position
                            if (searchDepth == settings.maxSearchDepth && typeof settings.lastResort === "string") {
                                position = settings.lastResort;
                            }

                            switch (position) {
                                case "top left":
                                    positioning = {
                                        top: "auto",
                                        bottom: parent.height - target.top + distanceAway,
                                        left: target.left + offset,
                                        right: "auto",
                                    };
                                    break;
                                case "top center":
                                    positioning = {
                                        bottom: parent.height - target.top + distanceAway,
                                        left: target.left + (target.width / 2) - (popup.width / 2) + offset,
                                        top: "auto",
                                        right: "auto",
                                    };
                                    break;
                                case "top right":
                                    positioning = {
                                        bottom: parent.height - target.top + distanceAway,
                                        right: parent.width - target.left - target.width - offset,
                                        top: "auto",
                                        left: "auto",
                                    };
                                    break;
                                case "left center":
                                    positioning = {
                                        top: target.top + (target.height / 2) - (popup.height / 2) + offset,
                                        right: parent.width - target.left + distanceAway,
                                        left: "auto",
                                        bottom: "auto",
                                    };
                                    break;
                                case "right center":
                                    positioning = {
                                        top: target.top + (target.height / 2) - (popup.height / 2) + offset,
                                        left: target.left + target.width + distanceAway,
                                        bottom: "auto",
                                        right: "auto",
                                    };
                                    break;
                                case "bottom left":
                                    positioning = {
                                        top: target.top + target.height + distanceAway,
                                        left: target.left + offset,
                                        bottom: "auto",
                                        right: "auto",
                                    };
                                    break;
                                case "bottom center":
                                    positioning = {
                                        top: target.top + target.height + distanceAway,
                                        left: target.left + (target.width / 2) - (popup.width / 2) + offset,
                                        bottom: "auto",
                                        right: "auto",
                                    };
                                    break;
                                case "bottom right":
                                    positioning = {
                                        top: target.top + target.height + distanceAway,
                                        right: parent.width - target.left - target.width - offset,
                                        left: "auto",
                                        bottom: "auto",
                                    };
                                    break;
                            }
                            if (positioning === undefined) {
                                module.error(error.invalidPosition, position);
                            }

                            module.debug("Calculated popup positioning values", positioning);

            // tentatively place on stage
                            $popup
                                .css(positioning)
                                .removeClass(className.position)
                                .addClass(position)
                                .addClass(className.loading)
            ;

                            popupOffset = module.get.popupOffset();

            // see if any boundaries are surpassed with this tentative position
                            distanceFromBoundary = module.get.distanceFromBoundary(popupOffset, calculations);

                            if (module.is.offstage(distanceFromBoundary, position)) {
                                module.debug("Position is outside viewport", position);
                                if (searchDepth < settings.maxSearchDepth) {
                                    searchDepth++;
                                    position = module.get.nextPosition(position);
                                    module.debug("Trying new position", position);
                                    return ($popup)
                  ? module.set.position(position, calculations)
                  : false
                ;
                                }

                                if (settings.lastResort) {
                                    module.debug("No position found, showing with last position");
                                } else {
                                    module.debug("Popup could not find a position to display", $popup);
                                    module.error(error.cannotPlace, element);
                                    module.remove.attempts();
                                    module.remove.loading();
                                    module.reset();
                                    settings.onUnplaceable.call($popup, element);
                                    return false;
                                }
                            }
                            module.debug("Position is on stage", position);
                            module.remove.attempts();
                            module.remove.loading();
                            if (settings.setFluidWidth && module.is.fluid()) {
                                module.set.fluidWidth(calculations);
                            }
                            return true;
                        },

                        fluidWidth(calculations) {
                            calculations = calculations || module.get.calculations();
                            module.debug("Automatically setting element width to parent width", calculations.parent.width);
                            $popup.css("width", calculations.container.width);
                        },

                        variation(variation) {
                            variation = variation || module.get.variation();
                            if (variation && module.has.popup()) {
                                module.verbose("Adding variation to popup", variation);
                                $popup.addClass(variation);
                            }
                        },

                        visible() {
                            $module.addClass(className.visible);
                        },
                    },

                    remove: {
                        loading() {
                            $popup.removeClass(className.loading);
                        },
                        variation(variation) {
                            variation = variation || module.get.variation();
                            if (variation) {
                                module.verbose("Removing variation", variation);
                                $popup.removeClass(variation);
                            }
                        },
                        visible() {
                            $module.removeClass(className.visible);
                        },
                        attempts() {
                            module.verbose("Resetting all searched positions");
                            searchDepth = 0;
                            triedPositions = false;
                        },
                    },

                    bind: {
                        events() {
                            module.debug("Binding popup events to module");
                            if (settings.on == "click") {
                                $module
                                    .on(`click${eventNamespace}`, module.toggle)
              ;
                            }
                            if (settings.on == "hover" && hasTouch) {
                                $module
                                    .on(`touchstart${eventNamespace}`, module.event.touchstart)
              ;
                            }
                            if (module.get.startEvent()) {
                                $module
                                    .on(module.get.startEvent() + eventNamespace, module.event.start)
                                    .on(module.get.endEvent() + eventNamespace, module.event.end)
              ;
                            }
                            if (settings.target) {
                                module.debug("Target set to element", $target);
                            }
                            $window.on(`resize${elementNamespace}`, module.event.resize);
                        },
                        popup() {
                            module.verbose("Allowing hover events on popup to prevent closing");
                            if ($popup && module.has.popup()) {
                                $popup
                                    .on(`mouseenter${eventNamespace}`, module.event.start)
                                    .on(`mouseleave${eventNamespace}`, module.event.end)
              ;
                            }
                        },
                        close() {
                            if (settings.hideOnScroll === true || (settings.hideOnScroll == "auto" && settings.on != "click")) {
                                $scrollContext
                                    .one(module.get.scrollEvent() + elementNamespace, module.event.hideGracefully)
              ;
                            }
                            if (settings.on == "hover" && openedWithTouch) {
                                module.verbose("Binding popup close event to document");
                                $document
                                    .on(`touchstart${elementNamespace}`, (event) => {
                                        module.verbose("Touched away from popup");
                                        module.event.hideGracefully.call(element, event);
                                    })
              ;
                            }
                            if (settings.on == "click" && settings.closable) {
                                module.verbose("Binding popup close event to document");
                                $document
                                    .on(`click${elementNamespace}`, (event) => {
                                        module.verbose("Clicked away from popup");
                                        module.event.hideGracefully.call(element, event);
                                    })
              ;
                            }
                        },
                    },

                    unbind: {
                        events() {
                            $window
                                .off(elementNamespace)
            ;
                            $module
                                .off(eventNamespace)
            ;
                        },
                        close() {
                            $document
                                .off(elementNamespace)
            ;
                            $scrollContext
                                .off(elementNamespace)
            ;
                        },
                    },

                    has: {
                        popup() {
                            return ($popup && $popup.length > 0);
                        },
                    },

                    is: {
                        offstage(distanceFromBoundary, position) {
                            const
              offstage = []
            ;
            // return boundaries that have been surpassed
                            $.each(distanceFromBoundary, (direction, distance) => {
                                if (distance < -settings.jitter) {
                                    module.debug("Position exceeds allowable distance from edge", direction, distance, position);
                                    offstage.push(direction);
                                }
                            });
                            if (offstage.length > 0) {
                                return true;
                            }

                            return false;
                        },
                        svg(element) {
                            return module.supports.svg() && (element instanceof SVGGraphicsElement);
                        },
                        active() {
                            return $module.hasClass(className.active);
                        },
                        animating() {
                            return ($popup !== undefined && $popup.hasClass(className.animating));
                        },
                        fluid() {
                            return ($popup !== undefined && $popup.hasClass(className.fluid));
                        },
                        visible() {
                            return ($popup !== undefined && $popup.hasClass(className.visible));
                        },
                        dropdown() {
                            return $module.hasClass(className.dropdown);
                        },
                        hidden() {
                            return !module.is.visible();
                        },
                        rtl() {
                            return $module.css("direction") == "rtl";
                        },
                    },

                    reset() {
                        module.remove.visible();
                        if (settings.preserve) {
                            if ($.fn.transition !== undefined) {
                                $popup
                                    .transition("remove transition")
              ;
                            }
                        } else {
                            module.removePopup();
                        }
                    },

                    setting(name, value) {
                        if ($.isPlainObject(name)) {
                            $.extend(true, settings, name);
                        } else if (value !== undefined) {
                            settings[name] = value;
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

    $.fn.popup.settings = {

        name: "Popup",

  // module settings
        silent: false,
        debug: false,
        verbose: false,
        performance: true,
        namespace: "popup",

  // whether it should use dom mutation observers
        observeChanges: true,

  // callback only when element added to dom
        onCreate() {},

  // callback before element removed from dom
        onRemove() {},

  // callback before show animation
        onShow() {},

  // callback after show animation
        onVisible() {},

  // callback before hide animation
        onHide() {},

  // callback when popup cannot be positioned in visible screen
        onUnplaceable() {},

  // callback after hide animation
        onHidden() {},

  // when to show popup
        on: "hover",

  // element to use to determine if popup is out of boundary
        boundary: window,

  // whether to add touchstart events when using hover
        addTouchEvents: true,

  // default position relative to element
        position: "top left",

  // name of variation to use
        variation: "",

  // whether popup should be moved to context
        movePopup: true,

  // element which popup should be relative to
        target: false,

  // jq selector or element that should be used as popup
        popup: false,

  // popup should remain inline next to activator
        inline: false,

  // popup should be removed from page on hide
        preserve: false,

  // popup should not close when being hovered on
        hoverable: false,

  // explicitly set content
        content: false,

  // explicitly set html
        html: false,

  // explicitly set title
        title: false,

  // whether automatically close on clickaway when on click
        closable: true,

  // automatically hide on scroll
        hideOnScroll: "auto",

  // hide other popups on show
        exclusive: false,

  // context to attach popups
        context: "body",

  // context for binding scroll events
        scrollContext: window,

  // position to prefer when calculating new position
        prefer: "opposite",

  // specify position to appear even if it doesn't fit
        lastResort: false,

  // delay used to prevent accidental refiring of animations due to user error
        delay: {
            show: 50,
            hide: 70,
        },

  // whether fluid variation should assign width explicitly
        setFluidWidth: true,

  // transition settings
        duration: 200,
        transition: "scale",

  // distance away from activating element in px
        distanceAway: 0,

  // number of pixels an element is allowed to be "offstage" for a position to be chosen (allows for rounding)
        jitter: 2,

  // offset on aligning axis from calculated position
        offset: 0,

  // maximum times to look for a position before failing (9 positions total)
        maxSearchDepth: 15,

        error: {
            invalidPosition: "The position you specified is not a valid position",
            cannotPlace: "Popup does not fit within the boundaries of the viewport",
            method: "The method you called is not defined.",
            noTransition: "This module requires ui transitions <https://github.com/Semantic-Org/UI-Transition>",
            notFound: "The target or popup you specified does not exist on the page",
        },

        metadata: {
            activator: "activator",
            content: "content",
            html: "html",
            offset: "offset",
            position: "position",
            title: "title",
            variation: "variation",
        },

        className: {
            active: "active",
            animating: "animating",
            dropdown: "dropdown",
            fluid: "fluid",
            loading: "loading",
            popup: "ui popup",
            position: "top left center bottom right",
            visible: "visible",
        },

        selector: {
            popup: ".ui.popup",
        },

        templates: {
            escape(string) {
                let
                    badChars = /[&<>"'`]/g,
                    shouldEscape = /[&<>"'`]/,
                    escape = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;",
                        "'": "&#x27;",
                        "`": "&#x60;",
                    },
                    escapedChar = function (chr) {
                        return escape[chr];
                    }
                    ;
                if (shouldEscape.test(string)) {
                    return string.replace(badChars, escapedChar);
                }
                return string;
            },
            popup(text) {
                let
                    html = "",
                    escape = $.fn.popup.settings.templates.escape
                    ;
                if (typeof text !== undefined) {
                    if (typeof text.title !== undefined && text.title) {
                        text.title = escape(text.title);
                        html += `<div class="header">${text.title}</div>`;
                    }
                    if (typeof text.content !== undefined && text.content) {
                        text.content = escape(text.content);
                        html += `<div class="content">${text.content}</div>`;
                    }
                }
                return html;
            },
        },

    };
}(jQuery, window, document));
