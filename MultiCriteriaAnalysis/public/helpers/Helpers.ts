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

        private static pieRadius : number = 300;
        public static pieColors = ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"];

        public static drawPie(data?: any) {
            Utils.clearSvg();

            if (!data) return;

            var width = Utils.pieRadius,
                height = Utils.pieRadius,
                radius = Math.min(width, height) / 2,
                innerRadius = 0.3 * radius;

            var pie = d3.layout.pie()
                .sort(null)
                .value(d => d.width);

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, 0])
                .html(d => d.data.label + ": <span style='color:orangered'>" + Math.round(d.data.weight * 100) + "%</span>");

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => (radius - innerRadius) * (d.data.score / 100.0) + innerRadius);

            var outlineArc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(radius);

            var svg = d3.select("#pieChart").append("svg")
                .attr("id", "the_SVG_ID")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            try {
                svg.call(tip);
            }
            catch (err) {
                svg.call(tip);      //Utils.drawPie(data);
                console.log("Error: " + err.message);
            }

            var path = svg.selectAll(".solidArc")
                .data(pie(data))
                .enter().append("path")
                .attr("fill", function (d) { return d.data.color; })
                .attr("class", "solidArc")
                .attr("stroke", "gray")
                .attr("d", arc)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            var outerPath = svg.selectAll(".outlineArc")
                .data(pie(data))
                .enter().append("path")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("class", "outlineArc")
                .attr("d", outlineArc);
        }

        public static clearSvg() {
            var svgElement = d3.select("#the_SVG_ID");
            if (svgElement) svgElement.remove();
        }

        /** See http://bl.ocks.org/bbest/2de0e25d4840c68f2db1 */
        public static drawAsterPlot(data?: any) {
            Utils.clearSvg();

            if (!data) return;

            var width = Utils.pieRadius,
                height = Utils.pieRadius,
                radius = Math.min(width, height) / 2,
                innerRadius = 0.3 * radius;

            var pie = d3.layout.pie()
                .sort(null)
                .value(d => d.width);

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, 0])
                .html(d => d.data.label + ": <span style='color:orangered'>&nbsp; Weight: " + Math.round(d.data.weight * 100) + "%,&nbsp; Score: " + Math.round(d.data.score) + ",&nbsp; Weight*Score: " + Math.round(d.data.weight * d.data.score) + "</span>");

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => (radius - innerRadius) * (d.data.score / 100.0) + innerRadius);

            var outlineArc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(radius);

            var svg = d3.select("#pieChart").append("svg")
                .attr("id", "the_SVG_ID")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            try {
                svg.call(tip);
            }
            catch (err) {
                console.log("Error: " + err.message);
            }

            var path = svg.selectAll(".solidArc")
                .data(pie(data))
                .enter().append("path")
                .attr("fill", function (d) { return d.data.color; })
                .attr("class", "solidArc")
                .attr("stroke", "gray")
                .attr("d", arc)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            var outerPath = svg.selectAll(".outlineArc")
                .data(pie(data))
                .enter().append("path")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("class", "outlineArc")
                .attr("d", outlineArc);


            // calculate the weighted mean score
            var score = data.reduce(function (a, b) {
                    //console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
                    return a + (b.score * b.weight);
                }, 0) /
                data.reduce(function (a, b) {
                    return a + b.weight;
                }, 0);

            svg.append("svg:text")
                .attr("class", "aster-score")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle") // text-align: right
                .text(Math.round(score));
        }

    }
}