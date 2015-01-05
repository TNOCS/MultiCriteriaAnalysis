var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
            $scope.selectedItem = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
        }
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
            var criterion = new Models.Criteria();
            criterion.subCriterias = this.projectService.project.criterias;
            criterion.calculateWeights();
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
                    header: function () { return "Create a new solution"; }
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
                    color: Helpers.Utils.pieColors[k % Helpers.Utils.pieColors.length],
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
        //public fixWeights(data: any[]) {
        //    var totalWeight = 0;
        //    if (data.length === 0) return;
        //    data.forEach((c) => {
        //        totalWeight += c.userWeight;
        //    });
        //    if (totalWeight == 0) return;
        //    data.forEach((c) => {
        //        c.weight = c.userWeight / totalWeight;
        //    });
        //}
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
                        totalScore += score[criterionId].weight * score[criterionId].value;
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
            return totalScore;
        };
        SolutionsCtrl.prototype.eachCriteria = function (criterias, parentWeight) {
            if (parentWeight === void 0) { parentWeight = 1; }
            var activeScenario = this.selectedScenario;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias, parentWeight * criteria.weight);
                }
                else {
                    var selectedId = '';
                    if (activeScenario.id in this.projectService.activeSolution.scores && criteria.id in this.projectService.activeSolution.scores[activeScenario.id]) {
                        selectedId = this.projectService.activeSolution.scores[activeScenario.id][criteria.id].criteriaOptionId;
                    }
                    this.activeCriterias.push(new SelectableCriterion(criteria, selectedId, parentWeight));
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
    var SelectableCriterion = (function (_super) {
        __extends(SelectableCriterion, _super);
        function SelectableCriterion(criterion, selectedId, parentWeight) {
            _super.call(this);
            this.criterion = criterion;
            this.selectedId = selectedId;
            this.id = criterion.id;
            this.title = criterion.title;
            this.description = criterion.description;
            this.userWeight = criterion.userWeight;
            this.weight = criterion.weight * parentWeight;
            this.options = criterion.options;
        }
        return SelectableCriterion;
    })(Models.Criteria);
    Solutions.SelectableCriterion = SelectableCriterion;
    var GetTitleDialogCtrl = (function () {
        function GetTitleDialogCtrl($scope, $modalInstance, header) {
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.header = header;
            $scope.vm = this;
            $scope.header = header;
        }
        GetTitleDialogCtrl.prototype.ok = function () {
            this.$modalInstance.close(this.title);
        };
        GetTitleDialogCtrl.prototype.cancel = function () {
            this.$modalInstance.dismiss('cancel');
        };
        GetTitleDialogCtrl.$inject = [
            '$scope',
            '$modalInstance',
            'header'
        ];
        return GetTitleDialogCtrl;
    })();
    Solutions.GetTitleDialogCtrl = GetTitleDialogCtrl;
})(Solutions || (Solutions = {}));
//# sourceMappingURL=SolutionsCtrl.js.map