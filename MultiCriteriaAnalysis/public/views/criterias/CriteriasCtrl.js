﻿var Criterias;
(function (Criterias) {
    var CriteriasCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function CriteriasCtrl($scope, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.messageBus = messageBus;
            this.projectService = projectService;
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            console.log('CriteriasCtrl');

            console.log(JSON.stringify(projectService.project, null, 2));

            $scope.reorder = false;

            $scope.selectedItem = {};

            $scope.options = {};

            $scope.remove = function (scope) {
                scope.remove();
            };

            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.newSubCriteria = function (scope) {
                var criteria = scope.$modelValue;
                var c = new Models.Criteria();
                c.title = criteria.title + '.' + (criteria.subCriterias.length + 1);
                c.userWeight = 1;
                criteria.subCriterias.push(c);
            };

            $scope.newOption = function (scope) {
                var criteria = scope.$modelValue;
                var o = new Models.CriteriaOption();
                o.title = "New Option";
                criteria.options.push(o);
            };

            $scope.newCriteria = function () {
                var c = new Models.Criteria();
                c.title = "New Criteria";
                c.userWeight = 1;
                _this.projectService.project.criterias.push(c);
            };
        }
        CriteriasCtrl.prototype.select = function (item) {
            if (!item) {
                item = new Models.Criteria();
                item.title = "Top level overview";
                item.subCriterias = this.projectService.project.criterias;
            }
            this.selectedItem = item;
            this.drawPie();
        };

        CriteriasCtrl.prototype.drawPie = function () {
            var svgElement = d3.select("#the_SVG_ID");
            if (svgElement)
                svgElement.remove();

            var colors = ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"];
            var width = 500, height = 500, radius = Math.min(width, height) / 2, innerRadius = 0.3 * radius;

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

            svg.call(tip);

            var data = [];
            this.selectedItem.calculateWeights();
            for (var k in this.selectedItem.subCriterias) {
                var criteria = this.selectedItem.subCriterias[k];
                data.push({
                    id: k + 1,
                    order: k + 1,
                    color: colors[k % colors.length],
                    weight: criteria.weight,
                    score: 100,
                    width: criteria.weight,
                    label: criteria.title
                });
            }

            var path = svg.selectAll(".solidArc").data(pie(data)).enter().append("path").attr("fill", function (d) {
                return d.data.color;
            }).attr("class", "solidArc").attr("stroke", "gray").attr("d", arc).on('mouseover', tip.show).on('mouseout', tip.hide);

            var outerPath = svg.selectAll(".outlineArc").data(pie(data)).enter().append("path").attr("fill", "none").attr("stroke", "gray").attr("class", "outlineArc").attr("d", outlineArc);
            // calculate the weighted mean score
            //var score =
            //    data.reduce(function (a, b) {
            //        //console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
            //        return a + (b.score * b.weight);
            //    }, 0) /
            //    data.reduce(function (a, b) {
            //        return a + b.weight;
            //    }, 0);
            //svg.append("svg:text")
            //    .attr("class", "aster-score")
            //    .attr("dy", ".35em")
            //    .attr("text-anchor", "middle") // text-align: right
            //    .text(Math.round(score));
            //});
        };
        CriteriasCtrl.$inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];
        return CriteriasCtrl;
    })();
    Criterias.CriteriasCtrl = CriteriasCtrl;
})(Criterias || (Criterias = {}));
//# sourceMappingURL=CriteriasCtrl.js.map
