var Comparisons;
(function (Comparisons) {
    var ComparisonsCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function ComparisonsCtrl($scope, $modal, $timeout, $log, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.$log = $log;
            this.messageBus = messageBus;
            this.projectService = projectService;
            this.compareToSolutions = [];
            this.scenarios = [];
            this.activeCriterias = [];
            $scope.vm = this;
            this.solutions = projectService.project.solutions;
            this.createScenarioTree(projectService.project.rootScenario);
            $scope.selectedItem = this.scenarios[0];
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            if (projectService.activeSolution == null) {
                projectService.activeSolution = this.solutions.length > 0 ? this.solutions[this.solutions.length - 1] : null;
            }
            this.solutions.forEach(function (s) {
                if (s.id !== projectService.activeSolution.id)
                    _this.compareToSolutions.push(s);
            });
            if (projectService.compareToSolutions.length === 0) {
                if (this.compareToSolutions.length > 1)
                    projectService.compareToSolutions.push(this.compareToSolutions[this.compareToSolutions.length - 1]);
            }
            else {
                var i = projectService.compareToSolutions.indexOf(projectService.activeSolution);
                if (i >= 0)
                    projectService.compareToSolutions.slice(i, 1);
            }
            //$scope.$watch('this.projectService.compareToSolutions', () => { alert('Changed'); this.select(); }, true);
            if (!projectService.activeScenario)
                return;
            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(function () { return _this.select(projectService.activeScenario); }, 0);
        }
        ComparisonsCtrl.prototype.createScenarioTree = function (scenario, indent) {
            var _this = this;
            if (indent === void 0) { indent = 0; }
            this.scenarios.push({
                title: this.spaces(indent) + scenario.title,
                scenario: scenario
            });
            if (scenario.hasSubs()) {
                scenario.subScenarios.forEach(function (s) {
                    _this.createScenarioTree(s, indent + 2);
                });
            }
        };
        /**
         * Return indent number of spaces.
         */
        ComparisonsCtrl.prototype.spaces = function (indent) {
            if (indent === void 0) { indent = 0; }
            if (indent === 0)
                return '';
            var result = ' ';
            indent *= 2;
            while (--indent > 0) {
                result += '\u00A0';
            }
            return result;
        };
        ComparisonsCtrl.prototype.changeActiveSolution = function () {
            var _this = this;
            this.compareToSolutions = [];
            this.solutions.forEach(function (s) {
                if (s.id !== _this.projectService.activeSolution.id)
                    _this.compareToSolutions.push(s);
            });
            this.select();
        };
        ComparisonsCtrl.prototype.select = function (scenario) {
            if (scenario === void 0) { scenario = this.selectedScenario; }
            this.selectedScenario = scenario;
            if (scenario == null)
                return;
            this.projectService.activeScenario = scenario;
            this.activeCriterias = [];
            if (!this.selectedScenario.hasSubs()) {
                this.eachCriteria(this.projectService.project.criterias);
            }
            this.updateResult();
        };
        /** Compute the data set for the bar chart. */
        ComparisonsCtrl.prototype.updateResult = function () {
            var _this = this;
            var scenario = this.selectedScenario;
            var solution = this.projectService.activeSolution;
            var data = new Helpers.GroupedBarChartData();
            data.series[0] = { label: solution.title, values: [] };
            if (scenario.hasSubs()) {
                scenario.subScenarios.forEach(function (s) {
                    data.labels.push(s.title.toUpperCase());
                    data.series[0].values.push(_this.getScaledScore(solution, s));
                });
                var i = 1;
                this.projectService.compareToSolutions.forEach(function (sol) {
                    data.series[i] = { label: sol.title, values: [] };
                    scenario.subScenarios.forEach(function (s) {
                        data.series[i].values.push(_this.getScaledScore(sol, s));
                    });
                    i++;
                });
                this.addScenarioResultsToData(data, scenario, true);
            }
            else {
                // Add the active solution to the data.
                //var scores = solution.scores;
                this.activeCriterias.forEach(function (c) {
                    data.labels.push(c.title);
                    data.series[0].values.push(c.getOptionValueById(c.selectedId) * 100);
                });
                var i = 0;
                // Add the compared solutions to the data.
                this.projectService.compareToSolutions.forEach(function (s) {
                    i++;
                    var scores = s.scores[scenario.id];
                    data.series[i] = { label: s.title, values: [] };
                    _this.activeCriterias.forEach(function (c) {
                        var result = scores.hasOwnProperty(c.id) ? c.getOptionValueById(scores[c.id].criteriaOptionId) * 100 : 0;
                        data.series[i].values.push(result);
                    });
                });
                this.addScenarioResultsToData(data, scenario, true);
            }
            Helpers.Utils.drawHorizontalGroupedBarChart(data, 300, 20, 20, 300, 150);
        };
        /** Scale and round the score. */
        ComparisonsCtrl.prototype.getScaledScore = function (solution, scenario) {
            return Math.round(solution.computeScore(scenario) * 100);
        };
        /**
         * Add scenario results to the data.
         */
        ComparisonsCtrl.prototype.addScenarioResultsToData = function (data, scenario, atStart) {
            if (atStart === void 0) { atStart = false; }
            var title = scenario.title.toUpperCase();
            var score = this.getScaledScore(this.projectService.activeSolution, scenario);
            if (atStart) {
                data.labels.unshift(title);
                data.series[0].values.unshift(score);
            }
            else {
                data.labels.push(title);
                data.series[0].values.push(score);
            }
            var i = 1;
            this.projectService.compareToSolutions.forEach(function (s) {
                var score = Math.round(s.computeScore(scenario) * 100);
                if (atStart)
                    data.series[i].values.unshift(score);
                else
                    data.series[i].values.push(score);
                i++;
            });
        };
        /**
         * The data source is changed in the menu.
         */
        ComparisonsCtrl.prototype.dataSourceChanged = function () {
            this.select(this.selectedScenario);
        };
        ComparisonsCtrl.prototype.eachCriteria = function (criterias, parentWeight, activeScenario) {
            if (parentWeight === void 0) { parentWeight = 1; }
            if (activeScenario === void 0) { activeScenario = this.selectedScenario; }
            var scores = this.projectService.activeSolution.scores;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (!criteria.isEnabled)
                    continue;
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias, parentWeight * criteria.weight, activeScenario);
                }
                else {
                    var selectedId = '';
                    if (this.projectService.activeDataSource == null || this.projectService.activeDataSource.id === criteria.dataSourceId) {
                        if (activeScenario.id in scores && criteria.id in scores[activeScenario.id])
                            selectedId = scores[activeScenario.id][criteria.id].criteriaOptionId;
                        this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                    }
                }
            }
        };
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        ComparisonsCtrl.$inject = [
            '$scope',
            '$modal',
            '$timeout',
            '$log',
            'messageBusService',
            'projectService'
        ];
        return ComparisonsCtrl;
    })();
    Comparisons.ComparisonsCtrl = ComparisonsCtrl;
})(Comparisons || (Comparisons = {}));
//# sourceMappingURL=ComparisonsCtrl.js.map