var csComp;
(function (csComp) {
    var Services;
    (function (Services) {
        // Handle returned when subscribing to a topic
        var MessageBusHandle = (function () {
            function MessageBusHandle(topic, callback) {
                this.topic = topic;
                this.callback = callback;
            }
            return MessageBusHandle;
        })();
        Services.MessageBusHandle = MessageBusHandle;
        /**
         * Simple message bus service, used for subscribing and unsubsubscribing to topics.
         * @see {@link https://gist.github.com/floatingmonkey/3384419}
         */
        var MessageBusService = (function () {
            function MessageBusService() {
                PNotify.prototype.options.styling = "fontawesome";
            }
            /**
             * Publish a notification
             * @title: the title of the notification
             * @text:  the contents of the notification
             */
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
            /**
             * Publish a notification
             * @title: the title of the notification
             * @text:  the contents of the notification
             */
            MessageBusService.prototype.notifyData = function (data) {
                var pn = new PNotify(data);
                //this.publish("notify", "", data);
            };
            /**
             * Publish to a topic
             */
            MessageBusService.prototype.publish = function (topic, title, data) {
                //window.console.log("publish: " + topic + ", " + title);
                if (!MessageBusService.cache[topic])
                    return;
                MessageBusService.cache[topic].forEach(function (cb) { return cb(title, data); });
            };
            //public publish(topic: string, title: string, data?: any): void {
            //	MessageBusService.publish(topic, title, data);
            //}
            /**
             * Subscribe to a topic
             * @param {string} topic The desired topic of the message.
             * @param {IMessageBusCallback} callback The callback to call.
             */
            MessageBusService.prototype.subscribe = function (topic, callback) {
                if (!MessageBusService.cache[topic])
                    MessageBusService.cache[topic] = new Array();
                MessageBusService.cache[topic].push(callback);
                return new MessageBusHandle(topic, callback);
            };
            //public subscribe(topic: string, callback: IMessageBusCallback): MessageBusHandle {            
            //	return MessageBusService.subscribe(topic, callback);
            //}
            /**
             * Unsubscribe to a topic by providing its handle
             */
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
        })();
        Services.MessageBusService = MessageBusService;
        var EventObj = (function () {
            function EventObj() {
            }
            // Events primitives ======================
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
        })();
        Services.EventObj = EventObj;
    })(Services = csComp.Services || (csComp.Services = {}));
})(csComp || (csComp = {}));
//# sourceMappingURL=MessageBus.js.map