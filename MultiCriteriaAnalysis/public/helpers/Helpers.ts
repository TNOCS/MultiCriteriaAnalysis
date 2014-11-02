module Helpers {
    export class Utils {
        public static createGuid(): string {
            var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            return guid;
        }

        /** Get the date as YYYYMMDDHHmm */
        public static getDate() {
            var now = new Date();
            return now.getFullYear() + Utils.getTwoDigit(now.getMonth()+1) + Utils.getTwoDigit(now.getDate()) + '_' + Utils.getTwoDigit(now.getHours()) + Utils.getTwoDigit(now.getMinutes());
        }

        public static getTwoDigit(nmbr: number): string {
            return (nmbr < 10 ? '0' : '') + nmbr;
        }

        public static isNullOrEmpty(s: string): boolean {
            return !s;
        }

        /**
         * String formatting
         * 'Added {0} by {1} to your collection'.f(title, artist)
         * 'Your balance is {0} USD'.f(77.7)
         */
        public static format(s: string, ...args: string[]): string {
            var i = args.length;

            while (i--) {
                // "gm" = RegEx options for Global search (more than one instance) and for Multiline search
                s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i]);
            }
            return s;
        }

        /**
         * Returns true if we are dealing with a number, false otherwise.
         */
        public static isNumber(n: any): boolean {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        /**
         * Returns true if we are dealing with a boolean, false otherwise.
         */
        public static isBoolean(s: any): boolean {
            return s === 'true' || s === 'false';
        }

    }
}