var Helpers;
(function (Helpers) {
    /**
     * Describes the data that is needed for drawing a horizontally grouped bar chart.
     */
    var GroupedBarChartData = (function () {
        function GroupedBarChartData() {
            /**
             * Names of the things you wish to group, such as the category names.
             */
            this.labels = [];
            /**
             * Data that you wish to display, e.g. the results in different years.
             */
            this.series = [];
        }
        return GroupedBarChartData;
    })();
    Helpers.GroupedBarChartData = GroupedBarChartData;
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
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
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
        Utils.drawPie = function (data, drawLegend) {
            if (drawLegend === void 0) { drawLegend = true; }
            Utils.clearSvg();
            if (!data)
                return;
            var width = 2 * Utils.pieRadius + (drawLegend ? 200 : 0), height = Math.max(2 * (Utils.pieRadius + Utils.borderOffset), (drawLegend ? (data.length + 1) * (Utils.legendRectSize + Utils.legendSpacing) : 0)), radius = Utils.pieRadius, innerRadius = 0.3 * radius;
            var pie = d3.layout.pie().sort(null).value(function (d) { return d.width; });
            var tip = d3.tip().attr('class', 'd3-tip').offset([0, 0]).html(function (d) { return d.data.label + ": <span style='color:orangered'>" + Math.round(d.data.weight * 100) + "%</span>"; });
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function (d) { return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius; });
            var outlineArc = d3.svg.arc().innerRadius(innerRadius).outerRadius(radius);
            var svg = d3.select("#pieChart").append("svg").attr("id", "the_SVG_ID").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + Utils.pieRadius + "," + (Utils.pieRadius + Utils.borderOffset) + ")");
            svg.call(tip);
            var path = svg.selectAll(".solidArc").data(pie(data)).enter().append("path").attr("fill", function (d) {
                return d.data.color;
            }).attr("class", "solidArc").attr("stroke", "gray").attr("d", arc).on('mouseover', tip.show).on('mouseout', tip.hide);
            var outerPath = svg.selectAll(".outlineArc").data(pie(data)).enter().append("path").attr("fill", "none").attr("stroke", "gray").attr("class", "outlineArc").attr("d", outlineArc);
            if (!drawLegend)
                return;
            Utils.drawLegend(svg, pie, data);
        };
        Utils.drawLegend = function (svg, pie, data) {
            var legend = svg.selectAll('.legend').data(pie(data)).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
                var height = Utils.legendRectSize + Utils.legendSpacing;
                var offset = Utils.pieRadius;
                var horz = 2 * Utils.pieRadius - Utils.legendRectSize;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });
            legend.append('rect').attr('width', Utils.legendRectSize).attr('height', Utils.legendRectSize).style('fill', function (d) {
                return d.data.color;
            }).style('stroke', function (d) {
                return d.data.color;
            });
            legend.append('text').attr('x', Utils.legendRectSize + Utils.legendSpacing).attr('y', Utils.legendRectSize - Utils.legendSpacing).text(function (d) {
                return d.data.label;
            });
        };
        Utils.clearSvg = function () {
            var svgElement = d3.select("#the_SVG_ID");
            if (svgElement)
                svgElement.remove();
        };
        /** See http://bl.ocks.org/bbest/2de0e25d4840c68f2db1 */
        Utils.drawAsterPlot = function (data, drawLegend) {
            if (drawLegend === void 0) { drawLegend = true; }
            Utils.clearSvg();
            if (!data)
                return;
            var width = 2 * Utils.pieRadius + (drawLegend ? 200 : 0), height = Math.max(2 * (Utils.pieRadius + Utils.borderOffset), (drawLegend ? (data.length + 1) * (Utils.legendRectSize + Utils.legendSpacing) : 0)), radius = Utils.pieRadius, innerRadius = 0.3 * radius;
            var pie = d3.layout.pie().sort(null).value(function (d) { return d.width; });
            var tip = d3.tip().attr('class', 'd3-tip').offset([0, 0]).html(function (d) { return d.data.label + ": <span style='color:white'>&nbsp; Weight: " + Math.round(d.data.weight * 100) + "%,&nbsp; Score: " + Math.round(d.data.score) + ",&nbsp; Weight*Score: " + Math.round(d.data.weight * d.data.score) + "</span>"; });
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function (d) { return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius; });
            var outlineArc = d3.svg.arc().innerRadius(innerRadius).outerRadius(radius);
            var svg = d3.select("#pieChart").append("svg").attr("id", "the_SVG_ID").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + Utils.pieRadius + "," + (Utils.pieRadius + Utils.borderOffset) + ")");
            svg.call(tip);
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
            if (!drawLegend)
                return;
            Utils.drawLegend(svg, pie, data);
        };
        /**
         * Draw a horizontally grouped bar chart.
         * @param {IGroupedBarChart} data - The data you wish to convert to a grouped bar chart.
         * @param {number} barWidth - The maximum width of a bar (default 300).
         * @param {number} barHeight - The height of a single bar (default 20).
         * @param {number} gapBetweenGroups - The vertical gap between two consequetive groups (default 10).
         * @param {number} spaceForLabels - The room at the left reserved for writing the labels (default 150).
         * @param {number} spaceForLegend - The room at the right reserved for writing the legend (default 150).
         * NOTE In your HTML code, it expects an svg element with class chart, e.g. <svg class="chart"></svg>
         * NOTE In your CSS code, you can use several classes: .chart .legend, .chart text, .chart .label, .chart .bar, .axis path, .axis line
         */
        Utils.drawHorizontalGroupedBarChart = function (data, barWidth, barHeight, gapBetweenGroups, spaceForLabels, spaceForLegend) {
            if (barWidth === void 0) { barWidth = 300; }
            if (barHeight === void 0) { barHeight = 20; }
            if (gapBetweenGroups === void 0) { gapBetweenGroups = 10; }
            if (spaceForLabels === void 0) { spaceForLabels = 150; }
            if (spaceForLegend === void 0) { spaceForLegend = 150; }
            var groupHeight = barHeight * data.series.length; // The height of a group of bars
            // Zip the series data together (first values, second values, etc.)
            var zippedData = [];
            for (var i = 0; i < data.labels.length; i++) {
                for (var j = 0; j < data.series.length; j++) {
                    zippedData.push(data.series[j].values[i]);
                }
            }
            // Color scale
            var color = d3.scale.category20();
            // Chart dimensions
            var chartWidth = spaceForLabels + barWidth + spaceForLegend; // The occupied width of the chart
            var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length; // The occupied height of the chart.
            // For translating the actual value to the width of the bar.
            var x = d3.scale.linear().domain([0, d3.max(zippedData)]).range([0, barWidth]);
            // For displaying the vertical line
            var y = d3.scale.linear().range([chartHeight + gapBetweenGroups, 0]);
            // Display the vertical line without ticks
            var yAxis = d3.svg.axis().scale(y).tickFormat(function () { return ''; }).tickSize(0).orient("left");
            $("#barChart").empty();
            // Specify the chart area and dimensions
            var chart = d3.select(".chart").attr("width", chartWidth).attr("height", chartHeight);
            // Create bars
            var bar = chart.selectAll("g").data(zippedData).enter().append("g").attr("transform", function (d, i) {
                return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.series.length))) + ")";
            });
            // Create rectangles of the correct width
            bar.append("rect").attr("fill", function (d, i) {
                return color(i % data.series.length);
            }).attr("class", "bar").attr("width", x).attr("height", barHeight - 1);
            // Add text label in bar
            bar.append("text").attr("x", function (d) {
                return x(d) - 3;
            }).attr("y", barHeight / 2).attr("dy", ".35em").text(function (d) {
                return d;
            });
            // Draw labels
            bar.append("text").attr("class", "label").attr("x", function (d) {
                return -10;
            }).attr("y", groupHeight / 2).attr("dy", ".35em").text(function (d, i) {
                if (i % data.series.length === 0)
                    return data.labels[Math.floor(i / data.series.length)];
                else
                    return "";
            });
            chart.append("g").attr("class", "y axis").attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")").call(yAxis);
            // Draw legend
            var legendRectSize = 18, legendSpacing = 4;
            var legend = chart.selectAll('.legend').data(data.series).enter().append('g').attr('transform', function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = -gapBetweenGroups / 2;
                var horz = spaceForLabels + barWidth + 40 - legendRectSize;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });
            legend.append('rect').attr('width', legendRectSize).attr('height', legendRectSize).style('fill', function (d, i) {
                return color(i);
            }).style('stroke', function (d, i) {
                return color(i);
            });
            legend.append('text').attr('class', 'legend').attr('x', legendRectSize + legendSpacing).attr('y', legendRectSize - legendSpacing).text(function (d) {
                return d.label;
            });
        };
        /**
         * Edit dialog.
         */
        Utils.editTextDialog = function (modal, title, text, callback) {
            var modalInstance = modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return title; },
                    title: function () { return text; },
                    description: function () { return ''; }
                }
            });
            modalInstance.result.then(function (newText) {
                callback(newText);
            }, function () {
                callback(text);
            });
        };
        /**
         * Delete dialog.
         */
        Utils.deleteDialog = function (modal, title, text, callback) {
            var modalInstance = modal.open({
                templateUrl: 'views/dialogs/ConfirmationDialog.html',
                controller: 'ConfirmationDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return title; },
                    question: function () { return text; }
                }
            });
            modalInstance.result.then(function (confirmation) {
                callback(confirmation);
            }, function () {
                callback(false);
            });
        };
        Utils.pieColors = d3.scale.category20();
        Utils.pieRadius = 50;
        Utils.borderOffset = 2;
        Utils.legendRectSize = 18;
        Utils.legendSpacing = 4;
        return Utils;
    })();
    Helpers.Utils = Utils;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=Helpers.js.map