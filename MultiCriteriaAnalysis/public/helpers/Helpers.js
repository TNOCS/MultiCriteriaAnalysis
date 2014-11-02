var Helpers;
(function (Helpers) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.createGuid = function () {
            var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            return guid;
        };

        /** Get the date as YYYYMMDDHHmm */
        Utils.getDate = function () {
            var now = new Date();
            return now.getFullYear() + Utils.getTwoDigit(now.getMonth() + 1) + Utils.getTwoDigit(now.getDate()) + '_' + Utils.getTwoDigit(now.getHours()) + Utils.getTwoDigit(now.getMinutes());
        };

        Utils.getTwoDigit = function (nmbr) {
            return (nmbr < 10 ? '0' : '') + nmbr;
        };

        Utils.isNullOrEmpty = function (s) {
            return !s;
        };

        /**
        * String formatting
        * 'Added {0} by {1} to your collection'.f(title, artist)
        * 'Your balance is {0} USD'.f(77.7)
        */
        Utils.format = function (s) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = args.length;

            while (i--) {
                // "gm" = RegEx options for Global search (more than one instance) and for Multiline search
                s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i]);
            }
            return s;
        };

        /**
        * Returns true if we are dealing with a number, false otherwise.
        */
        Utils.isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };

        /**
        * Returns true if we are dealing with a boolean, false otherwise.
        */
        Utils.isBoolean = function (s) {
            return s === 'true' || s === 'false';
        };
        return Utils;
    })();
    Helpers.Utils = Utils;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=Helpers.js.map
