var Scenarios;
(function (Scenarios) {
    var ScenariosCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function ScenariosCtrl($scope, $modal, $timeout, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.messageBus = messageBus;
            this.projectService = projectService;
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;
            //$scope.clicked = (data) => { 
            //    console.log(JSON.stringify(data, null, 2));
            //    this.selectedItem.effectedCriteriaIds = [];
            //    for (var k in $scope.multiSelectOptions) {
            //        var item = $scope.multiSelectOptions[k];
            //        if (item.ticked) this.selectedItem.effectedCriteriaIds.push(item.id);
            //    }
            //    console.log(this.selectedItem.effectedCriteriaIds);
            //}
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
            $scope.newScenario = function () {
                var scenario = new Models.Scenario();
                scenario.title = "New Scenario";
                _this.projectService.project.scenarios.push(scenario);
            };
            if (!projectService.activeScenario)
                return;
            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(function () { return _this.select(projectService.activeScenario); }, 0);
        }
        ScenariosCtrl.prototype.deleteScenario = function (scenario, parent) {
            var _this = this;
            var project = this.projectService.project;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete scenario', 'Are you sure you want to delete the scenario \'' + scenario.title + '\'?', function (ok) {
                if (!ok)
                    return;
                var scenarios = parent == null ? _this.projectService.project.scenarios : parent.subScenarios;
                var index = scenarios.indexOf(scenario);
                if (index < 0)
                    return;
                scenarios.splice(index, 1);
                _this.$scope.$apply();
            });
        };
        ScenariosCtrl.prototype.select = function (item) {
            if (!item) {
                // Create a pseudo criteria that is the level
                item = new Models.Scenario();
                item.title = "Top level scenario";
                item.subScenarios = this.projectService.project.scenarios;
            }
            this.selectedScenario = item;
            this.projectService.activeScenario = item;
            //var multiSelectOptions: any[] = [];
            //this.eachCriteria(multiSelectOptions, this.projectService.project.criterias);
            //this.$scope.multiSelectOptions = multiSelectOptions;
            var data = [];
            var parent = this.selectedScenario.findParent(this.projectService.project);
            parent.calculateWeights();
            for (var k in parent.subScenarios) {
                var scenario = parent.subScenarios[k];
                data.push({
                    id: k + 1,
                    order: k + 1,
                    color: Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: scenario.weight,
                    score: 100,
                    width: scenario.weight,
                    label: scenario.title
                });
            }
            if (data.length > 0)
                Helpers.Utils.drawPie(data);
            else
                Helpers.Utils.clearSvg();
        };
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        ScenariosCtrl.$inject = [
            '$scope',
            '$modal',
            '$timeout',
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