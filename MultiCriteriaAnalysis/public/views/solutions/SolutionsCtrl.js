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
            this.initializeCriteriaWeights();
            this.initializeScenarioWeights();
            this.initializeActiveScenarios(projectService.project.rootScenario);
            this.initializeSolution();
            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            }
            else if (typeof projectService.activeSolution === 'undefined') {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }
            $scope.selectedItem = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            projectService.project.updateScores();
            if (!projectService.activeScenario)
                return;
            $timeout(function () { return _this.select(projectService.activeScenario); }, 0);
        }
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
            this.projectService.project.updateCriteriaWeights();
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
        SolutionsCtrl.prototype.initializeSolution = function () {
            var sol = this.projectService.activeSolution;
            if (typeof sol === 'undefined' || sol === null)
                return;
            if (sol.scores === null)
                sol.scores = {};
            this.projectService.project.criterias.forEach(function (crit) {
                if (sol.scores[crit.id] === null)
                    sol.scores[crit.id] = {};
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
        SolutionsCtrl.prototype.resetCriteria = function (scenarioId, criteria) {
            var scores = this.projectService.activeSolution.scores;
            delete scores[scenarioId][criteria.id];
        };
        SolutionsCtrl.prototype.updateCriteria = function (scenarioId, weight, criteria) {
            var scores = this.projectService.activeSolution.scores;
            criteria.calculateWeights();
            var criteriaOptionId = scores[criteria.id][scenarioId]["criteriaOptionId"];
            scores[criteria.id][scenarioId]["value"] = criteria.getOptionValueById(criteriaOptionId);
            scores[criteria.id][scenarioId]["weight"] = weight;
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
        SolutionsCtrl.prototype.downloadCsv = function () {
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title.replace(/ /g, '_') + '.csv';
            var csv = Models.CsvModel.createCsvTemplate(this.projectService.project);
            Helpers.Utils.saveData(csv, filename);
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
