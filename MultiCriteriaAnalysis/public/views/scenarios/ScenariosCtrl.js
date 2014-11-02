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

            $scope.reorder = false;

            $scope.$on('$viewContentLoaded', function () {
                $('.multiselect').multiselect();
            });

            $scope.selectedItem = {};

            $scope.options = {};

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
        ScenariosCtrl.$inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];
        return ScenariosCtrl;
    })();
    Scenarios.ScenariosCtrl = ScenariosCtrl;
})(Scenarios || (Scenarios = {}));
//# sourceMappingURL=ScenariosCtrl.js.map
