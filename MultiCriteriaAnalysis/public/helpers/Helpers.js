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

        Utils.drawPie = function (data) {
            Utils.clearSvg();

            if (!data)
                return;

            var width = Utils.pieRadius, height = Utils.pieRadius, radius = Math.min(width, height) / 2, innerRadius = 0.3 * radius;

            var pie = d3.layout.pie().sort(null).value(function (d) {
                return d.width;
            });

            var tip = d3.tip().attr('class', 'd3-tip').offset([0, 0]).html(function (d) {
                return d.data.label + ": <span style='color:orangered'>" + Math.round(d.data.weight * 100) + "%</span>";
            });

            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function (d) {
                return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
            });

            var outlineArc = d3.svg.arc().innerRadius(innerRadius).outerRadius(radius);

            var svg = d3.select("#pieChart").append("svg").attr("id", "the_SVG_ID").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var path = svg.selectAll(".solidArc").data(pie(data)).enter().append("path").attr("fill", function (d) {
                return d.data.color;
            }).attr("class", "solidArc").attr("stroke", "gray").attr("d", arc).on('mouseover', tip.show).on('mouseout', tip.hide);

            var outerPath = svg.selectAll(".outlineArc").data(pie(data)).enter().append("path").attr("fill", "none").attr("stroke", "gray").attr("class", "outlineArc").attr("d", outlineArc);

            try  {
                svg.call(tip);
            } catch (err) {
                //Utils.drawPie(data);
                console.log("Error: " + err.message);
            }
        };

        Utils.clearSvg = function () {
            var svgElement = d3.select("#the_SVG_ID");
            if (svgElement)
                svgElement.remove();
        };

        /** See http://bl.ocks.org/bbest/2de0e25d4840c68f2db1 */
        Utils.drawAsterPlot = function (data) {
            Utils.clearSvg();

            if (!data)
                return;

            var width = Utils.pieRadius, height = Utils.pieRadius, radius = Math.min(width, height) / 2, innerRadius = 0.3 * radius;

            var pie = d3.layout.pie().sort(null).value(function (d) {
                return d.width;
            });

            var tip = d3.tip().attr('class', 'd3-tip').offset([0, 0]).html(function (d) {
                return d.data.label + ": <span style='color:white'>&nbsp; Weight: " + Math.round(d.data.weight * 100) + "%,&nbsp; Score: " + Math.round(d.data.score) + ",&nbsp; Weight*Score: " + Math.round(d.data.weight * d.data.score) + "</span>";
            });

            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function (d) {
                return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
            });

            var outlineArc = d3.svg.arc().innerRadius(innerRadius).outerRadius(radius);

            var svg = d3.select("#pieChart").append("svg").attr("id", "the_SVG_ID").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            try  {
                svg.call(tip);
            } catch (err) {
                console.log("Error: " + err.message);
            }

            var path = svg.selectAll(".solidArc").data(pie(data)).enter().append("path").attr("fill", function (d) {
                return d.data.color;
            }).attr("class", "solidArc").attr("stroke", "gray").attr("d", arc).on('mouseover', tip.show).on('mouseout', tip.hide);

            var outerPath = svg.selectAll(".outlineArc").data(pie(data)).enter().append("path").attr("fill", "none").attr("stroke", "gray").attr("class", "outlineArc").attr("d", outlineArc);

            // calculate the weighted mean score
            var score = data.reduce(function (a, b) {
                //console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
                return a + (b.score * b.weight);
            }, 0) / data.reduce(function (a, b) {
                return a + b.weight;
            }, 0);

            svg.append("svg:text").attr("class", "aster-score").attr("dy", ".35em").attr("text-anchor", "middle").text(Math.round(score));
        };
        Utils.pieRadius = 100;
        Utils.pieColors = d3.scale.category20();
        return Utils;
    })();
    Helpers.Utils = Utils;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=Helpers.js.map
