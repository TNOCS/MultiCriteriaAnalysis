var Scenarios;
(function (Scenarios) {
    var ScenariosCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function ScenariosCtrl($scope, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.messageBus = messageBus;
            this.projectService = projectService;
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            $scope.clicked = function (data) {
                console.log(JSON.stringify(data, null, 2));
                _this.selectedItem.effectedCriteriaIds = [];
                for (var k in $scope.multiSelectOptions) {
                    var item = $scope.multiSelectOptions[k];
                    if (item.ticked)
                        _this.selectedItem.effectedCriteriaIds.push(item.id);
                }
                console.log(_this.selectedItem.effectedCriteriaIds);
            };

            $scope.reorder = false;

            $scope.$on('$viewContentLoaded', function () {
                $('.multiselect').multiselect();
            });

            $scope.remove = function (scope) {
                scope.remove();
            };

            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.newSubScenario = function (scope) {
                var scenario = scope.$modelValue;
                var s = new Models.Scenario();
                s.title = scenario.title + '.' + (scenario.subScenarios.length + 1);
                s.userWeight = 1;
                scenario.subScenarios.push(s);
            };

            $scope.newCriteria = function () {
                var c = new Models.Criteria();
                c.title = "New Scenario";
                c.userWeight = 1;
                _this.projectService.project.criterias.push(c);
            };
        }
        ScenariosCtrl.prototype.select = function (item) {
            this.selectedItem = item;
            var multiSelectOptions = [];
            this.eachCriteria(multiSelectOptions, this.projectService.project.criterias);
            this.$scope.multiSelectOptions = multiSelectOptions;
        };

        ScenariosCtrl.prototype.eachCriteria = function (multiSelectOptions, criterias) {
            for (var k in criterias) {
                var criteria = criterias[k];
                if (criteria.hasSubcriteria()) {
                    multiSelectOptions.push(new CriteriaSelectorNode(criteria.title, true));
                    this.eachCriteria(multiSelectOptions, criteria.subCriterias);
                    multiSelectOptions.push(new CriteriaSelectorNode('', false));
                } else {
                    multiSelectOptions.push(new CriteriaSelectorLeaf(criteria.id, criteria.title, this.selectedItem.isSelectedCriteria(criteria.id)));
                }
            }
        };
        ScenariosCtrl.$inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];
        return ScenariosCtrl;
    })();
    Scenarios.ScenariosCtrl = ScenariosCtrl;

    var CriteriaSelectorLeaf = (function () {
        function CriteriaSelectorLeaf(id, title, ticked) {
            this.id = id;
            this.title = title;
            this.ticked = ticked;
        }
        return CriteriaSelectorLeaf;
    })();
    Scenarios.CriteriaSelectorLeaf = CriteriaSelectorLeaf;

    var CriteriaSelectorNode = (function () {
        function CriteriaSelectorNode(title, multiSelectGroup) {
            this.title = title;
            this.multiSelectGroup = multiSelectGroup;
        }
        return CriteriaSelectorNode;
    })();
    Scenarios.CriteriaSelectorNode = CriteriaSelectorNode;
})(Scenarios || (Scenarios = {}));
//# sourceMappingURL=ScenariosCtrl.js.map
