module Helpers {
    /**
     * Describes the data that is needed for drawing a horizontally grouped bar chart.
     */
    export class GroupedBarChartData {
        /**
         * Names of the things you wish to group, such as the category names.
         */
        labels: string[] = [];
        /**
         * Data that you wish to display, e.g. the results in different years.
         */
        series: {
            /**
             * Name of the first group of data that you wish to show, e.g. the year.
             */
            label: string;
            /**
             * Values belonging to this group of data. Values map to bar lengths.
             * NOTE The length of the values needs to be equal to the length of the labels.
             */
            values: number[];
            /**
             * Weights belonging to this group of data. Weights map to bar width/thickness.
             * NOTE The length of the weights needs to be equal to the length of the labels.
             */
            weights: number[];
        }[] = [];
    }

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
            return now.getFullYear() + Utils.getTwoDigit(now.getMonth() + 1) + Utils.getTwoDigit(now.getDate()) + '_' + Utils.getTwoDigit(now.getHours()) + Utils.getTwoDigit(now.getMinutes());
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

        static saveData(data: string, filename: string) {
            if (navigator.msSaveBlob) {
                // IE 10+
                var link: any = document.createElement('a');
                link.addEventListener("click", event => {
                    var blob = new Blob([data], { "type": "text/csv;charset=utf-8;" });
                    navigator.msSaveBlob(blob, filename);
                }, false);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (!Utils.supportsDataUri()) {
                // Older versions of IE: show the data in a new window
                var popup = window.open('', 'json', '');
                popup.document.body.innerHTML = '<pre>' + data + '</pre>';
            } else {
                // Support for browsers that support the data uri.
                var a: any = document.createElement('a');
                document.body.appendChild(a);
                a.href = 'data:text/json;charset=utf-8,' + encodeURI(data);
                a.target = '_blank';
                a.download = filename;
                a.click();
                document.body.removeChild(a);
            }
        }

        private static supportsDataUri() {
            var isOldIE = navigator.appName === "Microsoft Internet Explorer";
            var isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
            return !(isOldIE || isIE11);  //Return true if not any IE
        }

        public static pieColors = d3.scale.category20();

        private static pieRadius      = 50;
        private static borderOffset   = 2;
        private static legendRectSize = 18;
        private static legendSpacing  = 4;

        public static drawPie(data?: any, drawLegend = true) {
            Utils.clearSvg();

            if (!data) return;
            var sumOfWidths = 0;
            if ($.isArray(data)) {
                if (data.every((d) => { return (!d.width || d.width === 0); })) {
                    $('#pieChart').text('All weights are zero. To show the chart, increase the weights for the selected element.');
                    return;
                } else {
                    $('#pieChart').text('');
                }
            }

            var width = 2 * Utils.pieRadius + (drawLegend ? 200 : 0),
                height = Math.max(2 * (Utils.pieRadius + Utils.borderOffset), (drawLegend ? (data.length + 1) * (Utils.legendRectSize + Utils.legendSpacing) : 0)),
                radius = Utils.pieRadius,
                innerRadius = 0.3 * radius;

            var pie = d3.layout.pie()
                .sort(null)
                .value(d => d.width);

            var tip = (<any>d3).tip()
                .attr('class', 'd3-tip')
                .offset([0, 0])
                .html(d => d.data.label + ': <span style="color:orangered">' + Math.round(d.data.weight * 100) + '%</span>');

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => (radius - innerRadius) * (d.data.score / 100.0) + innerRadius);

            var outlineArc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(radius);

            var svg = d3.select('#pieChart').append('svg')
                .attr('id', 'the_SVG_ID')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + Utils.pieRadius + ',' + (Utils.pieRadius + Utils.borderOffset) + ')');

            svg.call(tip);

            var path = svg.selectAll('.solidArc')
                .data(pie(data))
                .enter().append('path')
                .attr('fill', function (d) { return d.data.color; })
                .attr('class', 'solidArc')
                .attr('stroke', 'gray')
                .attr('d', arc)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            var outerPath = svg.selectAll('.outlineArc')
                .data(pie(data))
                .enter().append('path')
                .attr('fill', 'none')
                .attr('stroke', 'gray')
                .attr('class', 'outlineArc')
                .attr('d', outlineArc);

            if (!drawLegend) return;

            Utils.drawLegend(svg, pie, data);
        }

        private static drawLegend(svg, pie, data) {
            var legend = svg.selectAll('.legend')
                .data(pie(data))
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function (d, i) {
                    var height = Utils.legendRectSize + Utils.legendSpacing;
                    var offset = Utils.pieRadius;
                    var horz = 2 * Utils.pieRadius - Utils.legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', Utils.legendRectSize)
                .attr('height', Utils.legendRectSize)
                .style('fill', function (d) { return d.data.color; })
                .style('stroke', function (d) { return d.data.color; });

            legend.append('text')
                .attr('x', Utils.legendRectSize + Utils.legendSpacing)
                .attr('y', Utils.legendRectSize - Utils.legendSpacing)
                .text(function (d) { return d.data.label; });
        }

        public static clearSvg() {
            var svgElement = d3.select('#the_SVG_ID');
            if (svgElement) svgElement.remove();
        }

        /** See http://bl.ocks.org/bbest/2de0e25d4840c68f2db1 */
        public static drawAsterPlot(data?: any, drawLegend = true) {
            Utils.clearSvg();

            if (!data) return;

            var width = 2 * Utils.pieRadius + (drawLegend ? 200 : 0),
                height = Math.max(2 * (Utils.pieRadius + Utils.borderOffset), (drawLegend ? (data.length + 1) * (Utils.legendRectSize + Utils.legendSpacing) : 0)),
                radius = Utils.pieRadius,
                innerRadius = 0.3 * radius;

            var pie = d3.layout.pie()
                .sort(null)
                .value(d => d.width);

            var tip = (<any>d3).tip()
                .attr('class', 'd3-tip')
                .offset([0, 0])
                .html(d => d.data.label + ': <span style="color:white">&nbsp; Weight: ' +
                    Math.round(d.data.weight * 100) +
                    '%,&nbsp; Score: ' +
                    Math.round(d.data.score) +
                    ',&nbsp; Weight*Score: ' +
                    Math.round(d.data.weight * d.data.score) + '</span>');

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => (radius - innerRadius) * (d.data.score / 100.0) + innerRadius);

            var outlineArc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(radius);

            var svg = d3.select('#pieChart').append('svg')
                .attr('id', 'the_SVG_ID')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + Utils.pieRadius + ',' + (Utils.pieRadius + Utils.borderOffset) + ')');

            svg.call(tip);

            var path = svg.selectAll('.solidArc')
                .data(pie(data))
                .enter().append('path')
                .attr('fill', function (d) { return d.data.color; })
                .attr('class', 'solidArc')
                .attr('stroke', 'gray')
                .attr('d', arc)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            var outerPath = svg.selectAll('.outlineArc')
                .data(pie(data))
                .enter().append('path')
                .attr('fill', 'none')
                .attr('stroke', 'gray')
                .attr('class', 'outlineArc')
                .attr('d', outlineArc);


            // calculate the weighted mean score
            var score = data.reduce(function (a, b) {
                //console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
                return a + (b.score * b.weight);
            }, 0) /
                data.reduce(function (a, b) {
                    return a + b.weight;
                }, 0);

            svg.append('svg:text')
                .attr('class', 'aster-score')
                .attr('dy', '.35em')
                .attr('text-anchor', 'middle') // text-align: right
                .text(Math.round(score));

            if (!drawLegend) return;

            Utils.drawLegend(svg, pie, data);
        }

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
         * NOTE For a simple non-grouped version of this chart, set the 'useGrouping' parameter to false. The first label will then serve as title, 
         *  the first series will serve as data. Additional entries will be ignored.
         */
        static drawHorizontalGroupedBarChart(data: GroupedBarChartData,
            barWidth = 300, minBarHeight = 5, maxBarHeight = 25, gapBetweenGroups = 10, spaceForLabels = 150, spaceForLegend = 150, useGrouping = true) {
            var groupHeight = maxBarHeight * data.series.length; // The height of a group of bars
            
            if (useGrouping === false) {
                spaceForLabels = 24;
            }

            // Zip the series data together (first values-weights, second values-weights, etc.)
            var zippedData = [];
            for (var i = 0; i < data.labels.length; i++) {
                for (var j = 0; j < data.series.length; j++) {
                    zippedData.push({ value: data.series[j].values[i], width: data.series[j].weights[i] });
                }
            }

            var tip = (<any>d3).tip()
                .attr('class', 'd3-tip')
                .offset([-8, 0])
                .html(d => '<span style="color:white">Weight: ' +
                    Math.round(d.width) +
                    ',&nbsp; Score: ' +
                    Math.round(d.value) +
                    '</span>');

            // Color scale
            var color = d3.scale.category20();

            // Chart dimensions
            var chartWidth  = spaceForLabels + barWidth + spaceForLegend;                               // The occupied width of the chart
            var chartHeight = maxBarHeight * zippedData.length + gapBetweenGroups * data.labels.length;    // The occupied height of the chart.

            // For translating the actual value to the width/thickness of the bar.
            var w = d3.scale.linear()
                .domain([0, 5])
                .range([minBarHeight, maxBarHeight]);

            // For translating the actual value to the length of the bar.
            var x = d3.scale.linear()
                .domain([0, d3.max(zippedData, function(d) { return d.value; })])
                .range([1, barWidth]);

            // For displaying the vertical line
            var y = d3.scale.linear()
                .range([chartHeight + gapBetweenGroups, 0]);

            // Display the vertical line without ticks
            var yAxis = d3.svg.axis()
                .scale(y)
                .tickFormat(() => '')
                .tickSize(0)
                .orient('left');

            $('#barChart').empty();

            // Specify the chart area and dimensions
            var chart = d3.select('.chart')
                .attr('width' , chartWidth)
                .attr('height', chartHeight)
                .data(zippedData);

            chart.call(tip);
            
            // Create bars
            var bar = chart.selectAll('g')
                .data(zippedData)
                .enter().append('g')
                .attr('transform', function (d, i) {
                    return 'translate(' + spaceForLabels + ',' + (i * maxBarHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.series.length))) + ')';
                });

            // Create rectangles of the correct width
            bar.append('rect')
                .attr('fill', function (d, i) { return color(i % data.series.length); })
                .attr('class', 'bar')
                .attr('width', function (d) { return x(d.value) })
                .attr('height', function (d) { return w(d.width) })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            // Add text label in bar
            bar.append('text')
                .attr('x', function (d) { return (d.value === 0) ? 12 : x(d.value) - 3; })
                .attr('y', function (d) { return w(d.width) / 2 })
                .attr('dy', '.35em')
                .text(function (d) { return d.value; });

            // Draw labels
            if (useGrouping === true) {
                bar.append('text')
                    .attr('class', 'label')
                    .attr('x', function(d) { return - 10; })
                    .attr('y', groupHeight / 2)
                    .attr('dy', '.35em')
                    .text(function(d, i) {
                        if (i % data.series.length === 0)
                            return data.labels[Math.floor(i / data.series.length)];
                        else
                            return '';
                    });

                chart.append('g')
                    .attr('class', 'y axis')
                    .attr('transform', 'translate(' + spaceForLabels + ', ' + -gapBetweenGroups / 2 + ')')
                    .call(yAxis);
            }

            // Draw legend
            var legendRectSize = (useGrouping === false) ? maxBarHeight - 4 : 18,
                legendSpacing = 4;

            var legend = chart.selectAll('.legend')
                .data(data.series)
                .enter()
                .append('g')
                .attr('transform', function (d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset = -gapBetweenGroups / 2;
                    var horz = spaceForLabels + barWidth + 40 - legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', function(d, i) { return color(i); })
                .style('stroke', function(d, i) { return color(i); });

            legend.append('text')
                .attr('class', 'legend')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function(d) { return d.label; });

            legend.append('text')
                .attr('class', 'legend-weight')
                .attr('x', legendRectSize / 2)
                .attr('y', legendRectSize / 2)
                .attr("dx", ".1em")
                .attr("dy", ".1em")
                .text(function(d) { return d.weights[0]; });

            // Draw axes
            chart.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", function(d) { return x(d.value) / 2 })
                .attr("y", chartHeight - 6)
                .text("Score");

            chart.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("x", -24)
                .attr("y", 0)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("Weight [0-5]");
        }

        /**
         * Edit dialog.
         */
        static editTextDialog(modal, title: string, text: string, callback: (text: string) => void) {
            var modalInstance = modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm', // = small or 'lg' for large
                resolve: {
                    header     : () => title,
                    title      : () => text,
                    description: () => ''
                }
            });

            modalInstance.result.then((newText: string) => {
                callback(newText);
            }, () => {
                callback(text);
            });
        }
        
        /**
         * Choose DecisionTree dialog.
         */
        static chooseDecisionTreeDialog(modal, title: string, text: string, trees: Solutions.IDecisionTree[], selectedTree: string, callback: (selectedTreeId: string) => void) {
            var modalInstance = modal.open({
                templateUrl: 'views/dialogs/chooseDecisionTreeDialog.html',
                controller: 'ChooseDecisionTreeDialogCtrl',
                size: 'sm', // = small or 'lg' for large
                resolve: {
                    header     : () => title,
                    title      : () => text,
                    description: () => '',
                    trees      : () => trees,
                    selectedTreeId: () => selectedTree || ''
                }
            });

            modalInstance.result.then((selectedTreeId: string) => {
                callback(selectedTreeId);
            }, () => {
                callback('');
            });
        }
        /**
         * Delete dialog.
         */
        static deleteDialog(modal, title: string, text: string, callback: (result: boolean) => void) {
            var modalInstance = modal.open({
                templateUrl: 'views/dialogs/confirmationDialog.html',
                controller: 'ConfirmationDialogCtrl',
                size: 'sm', // = small or 'lg' for large
                resolve: {
                    header  : () => title,
                    question: () => text
                }
            });

            modalInstance.result.then((confirmation: boolean) => {
                callback(confirmation);
            }, () => {
                    callback(false);
                });
        }
    }
}
