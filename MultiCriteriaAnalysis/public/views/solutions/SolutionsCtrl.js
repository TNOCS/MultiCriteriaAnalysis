var Solutions;
(function (Solutions) {
    var SolutionsCtrl = (function () {
        function SolutionsCtrl($scope, $modal, $timeout, $log, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.$log = $log;
            this.messageBus = messageBus;
            this.projectService = projectService;
            this.activeScenarios = [];
            this.activeCriterias = [];
            this.dataSourceFilter = function (value, idx) {
                if (_this.projectService.activeDataSource == null)
                    return true;
                return _this.projectService.activeDataSource.filter(value, idx);
            };
            $scope.vm = this;
            if (projectService.project == null)
                return;
            this.solutions = projectService.project.solutions;
            this.scenarios = projectService.project.scenarios;
            this.initializeDataSources();
            this.initializeCriteriaWeights();
            this.initializeScenarioWeights();
            this.initializeActiveScenarios(projectService.project.rootScenario);
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
            if (!projectService.activeScenario)
                return;
            $timeout(function () { return _this.select(projectService.activeScenario); }, 0);
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
            this.dataSources.push(new Models.DataSourceViewModel('all', '1', 'Show', function (value, idx) { return true; }));
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
            this.projectService.project.rootScenario.calculateWeights();
            var scenario = new Models.Scenario();
            scenario.subScenarios = this.projectService.project.scenarios;
            scenario.calculateWeights();
        };
        SolutionsCtrl.prototype.initializeActiveScenarios = function (scenario) {
            var _this = this;
            if (scenario.subScenarios.length === 0)
                return;
            scenario.subScenarios.forEach(function (s) {
                if (s.subScenarios.length === 0)
                    _this.activeScenarios.push(s);
                else
                    _this.initializeActiveScenarios(s);
            });
        };
        SolutionsCtrl.prototype.id = function (scenario, criteria) {
            return scenario.id + "-" + criteria.id;
        };
        SolutionsCtrl.prototype.deleteSolution = function () {
            var _this = this;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete solution', 'Are you sure you want to delete the solution \'' + this.projectService.activeSolution.title + '\'?', function (ok) {
                if (!ok)
                    return;
                var solutions = _this.projectService.project.solutions;
                var index = solutions.indexOf(_this.projectService.activeSolution);
                if (index < 0)
                    return;
                solutions.splice(index, 1);
                _this.projectService.activeSolution = solutions.length > 0
                    ? solutions[solutions.length - 1]
                    : null;
            });
        };
        SolutionsCtrl.prototype.editSolution = function () {
            var _this = this;
            Helpers.Utils.editTextDialog(this.$modal, 'Edit title', this.projectService.activeSolution.title, function (newTitle) {
                _this.projectService.activeSolution.title = newTitle;
            });
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
                item = new Models.Scenario();
                item.title = "Top level scenario";
                item.subScenarios = this.projectService.project.scenarios;
            }
            this.selectedScenario = item;
            this.projectService.activeScenario = item;
            this.activeCriterias = [];
        };
        SolutionsCtrl.prototype.toggleScenario = function (scenario) {
            return (scenario === this.selectedScenario);
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
                    score: this.projectService.activeSolution.computeScore(scenario) * 100,
                    width: scenario.weight,
                    label: scenario.title
                });
            }
            if (data.length > 0)
                Helpers.Utils.drawAsterPlot(data);
            else
                Helpers.Utils.clearSvg();
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
                    if (activeScenario.id in scores &&
                        criteria.id in scores[activeScenario.id]) {
                        selectedId = scores[activeScenario.id][criteria.id].criteriaOptionId;
                    }
                    this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                }
            }
        };
        SolutionsCtrl.$inject = [
            '$scope',
            '$modal',
            '$timeout',
            '$log',
            'messageBusService',
            'projectService'
        ];
        return SolutionsCtrl;
    })();
    Solutions.SolutionsCtrl = SolutionsCtrl;
})(Solutions || (Solutions = {}));
