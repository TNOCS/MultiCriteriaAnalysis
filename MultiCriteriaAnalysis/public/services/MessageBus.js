var csComp;
(function (csComp) {
    var Services;
    (function (Services) {
        var MessageBusHandle = (function () {
            function MessageBusHandle(topic, callback) {
                this.topic = topic;
                this.callback = callback;
            }
            return MessageBusHandle;
        }());
        Services.MessageBusHandle = MessageBusHandle;
        var MessageBusService = (function () {
            function MessageBusService() {
                PNotify.prototype.options.styling = "fontawesome";
            }
            MessageBusService.prototype.notify = function (title, text) {
                var options = {
                    title: title,
                    text: text,
                    icon: 'fa fa-info',
                    cornerclass: 'ui-pnotify-sharp',
                    addclass: "stack-bottomright",
                    stack: { "dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25 }
                };
                var pn = new PNotify(options);
            };
            MessageBusService.prototype.notifyBottom = function (title, text) {
                var stack_bar_bottom = { "dir1": "up", "dir2": "right", "spacing1": 0, "spacing2": 0 };
                var options = {
                    title: "Over Here",
                    text: "Check me out. I'm in a different stack.",
                    addclass: "stack-bar-bottom",
                    cornerclass: "",
                    width: "70%",
                    stack: stack_bar_bottom
                };
                var pn = new PNotify(options);
            };
            MessageBusService.prototype.notifyData = function (data) {
                var pn = new PNotify(data);
            };
            MessageBusService.prototype.publish = function (topic, title, data) {
                if (!MessageBusService.cache[topic])
                    return;
                MessageBusService.cache[topic].forEach(function (cb) { return cb(title, data); });
            };
            MessageBusService.prototype.subscribe = function (topic, callback) {
                if (!MessageBusService.cache[topic])
                    MessageBusService.cache[topic] = new Array();
                MessageBusService.cache[topic].push(callback);
                return new MessageBusHandle(topic, callback);
            };
            MessageBusService.prototype.unsubscribe = function (handle) {
                var topic = handle.topic;
                var callback = handle.callback;
                if (!MessageBusService.cache[topic])
                    return;
                MessageBusService.cache[topic].forEach(function (cb, idx) {
                    if (cb == callback) {
                        MessageBusService.cache[topic].splice(idx, 1);
                        return;
                    }
                });
            };
            MessageBusService.cache = {};
            return MessageBusService;
        }());
        Services.MessageBusService = MessageBusService;
        var EventObj = (function () {
            function EventObj() {
            }
            EventObj.prototype.bind = function (event, fct) {
                this.myEvents = this.myEvents || {};
                this.myEvents[event] = this.myEvents[event] || [];
                this.myEvents[event].push(fct);
            };
            EventObj.prototype.unbind = function (event, fct) {
                this.myEvents = this.myEvents || {};
                if (event in this.myEvents === false)
                    return;
                this.myEvents[event].splice(this.myEvents[event].indexOf(fct), 1);
            };
            EventObj.prototype.unbindEvent = function (event) {
                this.myEvents = this.myEvents || {};
                this.myEvents[event] = [];
            };
            EventObj.prototype.unbindAll = function () {
                this.myEvents = this.myEvents || {};
                for (var event in this.myEvents)
                    this.myEvents[event] = false;
            };
            EventObj.prototype.trigger = function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                this.myEvents = this.myEvents || {};
                if (event in this.myEvents === false)
                    return;
                for (var i = 0; i < this.myEvents[event].length; i++) {
                    this.myEvents[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
                }
            };
            EventObj.prototype.registerEvent = function (evtname) {
                this[evtname] = function (callback, replace) {
                    if (typeof callback == 'function') {
                        if (replace)
                            this.unbindEvent(evtname);
                        this.bind(evtname, callback);
                    }
                    return this;
                };
            };
            EventObj.prototype.registerEvents = function (evtnames) {
                var _this = this;
                evtnames.forEach(function (evtname) {
                    _this.registerEvent(evtname);
                });
            };
            return EventObj;
        }());
        Services.EventObj = EventObj;
    })(Services = csComp.Services || (csComp.Services = {}));
})(csComp || (csComp = {}));
