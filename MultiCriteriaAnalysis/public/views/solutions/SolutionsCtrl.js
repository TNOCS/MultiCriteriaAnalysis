var Solutions;
(function (Solutions) {
    var SolutionsCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function SolutionsCtrl($scope, $modal, $log, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$log = $log;
            this.messageBus = messageBus;
            this.projectService = projectService;
            this.activeCriterias = [];
            /**
             * Use the selected data source to filter the results.
             */
            this.dataSourceFilter = function (value, idx) {
                if (_this.projectService.activeDataSource == null)
                    return true;
                return _this.projectService.activeDataSource.filter(value, idx);
            };
            $scope.vm = this;
            this.solutions = projectService.project.solutions;
            this.scenarios = projectService.project.scenarios;
            this.initializeDataSources();
            this.initializeCriteriaWeights();
            this.initializeScenarioWeights();
            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            }
            else if (projectService.activeSolution == null) {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }
            this.updateWeightsAndScore();
            $scope.selectedItem = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
        }
        SolutionsCtrl.prototype.updateWeightsAndScore = function () {
            var _this = this;
            this.projectService.project.scenarios.forEach(function (scenario) {
                _this.eachCriteria(_this.projectService.project.criterias, 1, scenario);
            });
            this.activeCriterias = [];
        };
        SolutionsCtrl.prototype.initializeDataSources = function () {
            var _this = this;
            this.dataSources = [];
            this.dataSources.push(new Models.DataSourceViewModel('all', '1', 'Show', function (value, idx) {
                return true;
            }));
            this.dataSources.push(new Models.DataSourceViewModel('unassigned', '2', 'Show', function (value, idx) {
                return (value.selectedId == null || value.selectedId.length === 0);
            }));
            this.projectService.project.dataSources.forEach(function (ds) {
                _this.dataSources.push(new Models.DataSourceViewModel(ds.title, ds.id, 'Filter by model', function (value, idx) {
                    return value.criterion.dataSourceId === _this.projectService.activeDataSource.id;
                }));
            });
            if (this.projectService.activeDataSource != null) {
                var id = this.projectService.activeDataSource.id;
                for (var i = 0; i < this.dataSources.length; i++) {
                    var ds = this.dataSources[i];
                    if (ds.id !== id)
                        continue;
                    this.projectService.activeDataSource = ds;
                    break;
                }
            }
        };
        SolutionsCtrl.prototype.initializeCriteriaWeights = function () {
            this.projectService.project.rootCriterion.calculateWeights();
        };
        SolutionsCtrl.prototype.initializeScenarioWeights = function () {
            var scenario = new Models.Scenario();
            scenario.subScenarios = this.projectService.project.scenarios;
            scenario.calculateWeights();
        };
        SolutionsCtrl.prototype.deleteSolution = function () {
            var index = this.projectService.project.solutions.indexOf(this.projectService.activeSolution);
            if (index < 0)
                return;
            this.projectService.project.solutions.splice(index, 1);
            this.projectService.activeSolution = null;
        };
        SolutionsCtrl.prototype.createNewSolution = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return 'Create a new solution'; },
                    title: function () { return ''; },
                    description: function () { return ''; }
                }
            });
            modalInstance.result.then(function (title) {
                if (!title)
                    return;
                var solution = new Models.Solution();
                solution.title = title;
                _this.projectService.project.solutions.push(solution);
                _this.projectService.activeSolution = solution;
                _this.$log.info(_this.projectService.project.solutions);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        SolutionsCtrl.prototype.updateCriteria = function (criteria) {
            //console.log(JSON.stringify(criteria, null, 2));
            if (!(this.selectedScenario.id in this.projectService.activeSolution.scores)) {
                this.projectService.activeSolution.scores[this.selectedScenario.id] = {};
            }
            criteria.calculateWeights();
            this.projectService.activeSolution.scores[this.selectedScenario.id][criteria.id] = {
                criteriaOptionId: criteria.selectedId,
                value: criteria.getOptionValueById(criteria.selectedId),
                weight: criteria.weight
            };
            this.updateResult();
        };
        SolutionsCtrl.prototype.select = function (item) {
            if (!item) {
                // Create a pseudo scenario that is the top level
                item = new Models.Scenario();
                item.title = "Top level scenario";
                item.subScenarios = this.projectService.project.scenarios;
            }
            this.selectedScenario = item;
            this.activeCriterias = [];
            if (!this.selectedScenario.hasSubs()) {
                this.eachCriteria(this.projectService.project.criterias);
            }
            this.updateResult();
        };
        SolutionsCtrl.prototype.updateResult = function () {
            var data = [];
            var parent = this.selectedScenario.findParent(this.projectService.project);
            for (var k = 0; k < parent.subScenarios.length; k++) {
                var scenario = parent.subScenarios[k];
                data.push({
                    id: k + 1,
                    order: k + 1,
                    color: Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: scenario.weight,
                    score: this.computeScore(scenario) * 100,
                    width: scenario.weight,
                    label: scenario.title
                });
            }
            if (data.length > 0)
                Helpers.Utils.drawAsterPlot(data);
            else
                Helpers.Utils.clearSvg();
        };
        SolutionsCtrl.prototype.computeScore = function (scenario) {
            var _this = this;
            var totalScore = 0;
            if (!scenario.hasSubs()) {
                // Leaf node
                if (scenario.id in this.projectService.activeSolution.scores) {
                    var score = this.projectService.activeSolution.scores[scenario.id];
                    for (var criterionId in score) {
                        if (!score.hasOwnProperty(criterionId))
                            continue;
                        var criteriaScore = score[criterionId];
                        totalScore += criteriaScore.weight * criteriaScore.value;
                    }
                }
            }
            else {
                scenario.subScenarios.forEach(function (s) {
                    s.calculateWeights();
                    if (s.weight)
                        totalScore += s.weight * _this.computeScore(s);
                });
            }
            scenario.score = totalScore;
            return totalScore;
        };
        SolutionsCtrl.prototype.eachCriteria = function (criterias, parentWeight, activeScenario) {
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
                    if (activeScenario.id in scores && criteria.id in scores[activeScenario.id]) {
                        selectedId = scores[activeScenario.id][criteria.id].criteriaOptionId;
                    }
                    this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                }
            }
        };
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        SolutionsCtrl.$inject = [
            '$scope',
            '$modal',
            '$log',
            'messageBusService',
            'projectService'
        ];
        return SolutionsCtrl;
    })();
    Solutions.SolutionsCtrl = SolutionsCtrl;
})(Solutions || (Solutions = {}));
//# sourceMappingURL=SolutionsCtrl.js.map