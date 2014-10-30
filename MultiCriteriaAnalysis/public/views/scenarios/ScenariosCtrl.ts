module Scenarios {
    export interface IScenariosViewScope extends ng.IScope {
        vm                : ScenariosCtrl;
        selectedItem      : any;
        options           : any;
        remove            : Function;
        toggle            : Function;
        newSubCriteria    : Function;
        newSubScenario    : Function;
        newCriteria       : Function
        newOption         : Function;
        removeOption      : Function;
    }

    export class ScenariosCtrl {
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: IScenariosViewScope,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            $scope.selectedItem = {};

            $scope.options = {
            };

            $scope.remove = function (scope) {
                scope.remove();                
            };

            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.newSubScenario = (scope) => {
                var scenario = <Models.Scenario>scope.$modelValue;                
                var s = new Models.Scenario();
                s.title = scenario.title + '.' + (scenario.subScenarios.length + 1);
                s.userWeight = 1;
                scenario.subScenarios.push(s);
            };

            $scope.newCriteria = () => {
                var c = new Models.Criteria();
                c.title = "New Scenario";
                c.userWeight = 1;
                this.projectService.project.criterias.push(c);                
            };
        }
    }
}