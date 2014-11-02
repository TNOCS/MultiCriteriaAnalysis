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
            this.$scope = $scope;
            this.$modal = $modal;
            this.$log = $log;
            this.messageBus = messageBus;
            this.projectService = projectService;
            $scope.vm = this;

            this.solutions = projectService.project.solutions;
            this.dataSources = projectService.project.dataSources;
            this.scenarios = projectService.project.scenarios;

            console.log('SolutionsCtrl');

            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            } else if (projectService.activeSolution == null) {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }

            $scope.selectedItem = {};

            $scope.toggle = function (scope) {
                scope.toggle();
            };
        }
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
                    header: function () {
                        return "Create a new solution";
                    }
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
            if (!(this.selectedItem.id in this.projectService.activeSolution.scores)) {
                this.projectService.activeSolution.scores[this.selectedItem.id] = {};
            }
            this.projectService.activeSolution.scores[this.selectedItem.id][criteria.id] = {
                criteriaOptionId: criteria.selectedId,
                value: criteria.getOptionValueById(criteria.selectedId)
            };
        };

        SolutionsCtrl.prototype.select = function (item) {
            //console.log(JSON.stringify(item, null, 2));
            this.selectedItem = item;
            this.activeCriterias = [];
            this.eachCriteria(this.projectService.project.criterias);
            //this.$scope.multiSelectOptions = multiSelectOptions;
        };

        SolutionsCtrl.prototype.eachCriteria = function (criterias) {
            var activeScenario = this.selectedItem;
            for (var k in criterias) {
                var criteria = criterias[k];
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias);
                } else if (activeScenario.isSelectedCriteria(criteria.id)) {
                    var selectedId = '';
                    if (activeScenario.id in this.projectService.activeSolution.scores && criteria.id in this.projectService.activeSolution.scores[activeScenario.id]) {
                        selectedId = this.projectService.activeSolution.scores[activeScenario.id][criteria.id].criteriaOptionId;
                    }
                    this.activeCriterias.push(new SelectableCriterion(criteria, selectedId));
                }
            }
        };
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
        function SelectableCriterion(criterion, selectedId) {
            _super.call(this);
            this.criterion = criterion;
            this.selectedId = selectedId;
            this.id = criterion.id;
            this.title = criterion.title;
            this.description = criterion.description;
            this.userWeight = criterion.userWeight;
            this.weight = criterion.weight;
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
