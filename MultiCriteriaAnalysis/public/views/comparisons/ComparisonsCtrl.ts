module Comparisons {
    export interface IComparisonsViewScope extends ng.IScope {
        vm: ComparisonsCtrl;
        selectedItem: any;
        toggle: Function;
    }

    export class ComparisonsCtrl {
        public solutions       : Models.Solution[];
        public dataSources     : Models.DataSourceViewModel[];
        public scenarios       : Models.Scenario[];
        public selectedScenario: Models.Scenario;
        public activeCriterias : Solutions.SelectableCriterion[] = [];

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$modal',
            '$log',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope        : IComparisonsViewScope,
            private $modal        : any,
            private $log          : ng.ILogService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            this.solutions = projectService.project.solutions;
            this.scenarios = projectService.project.scenarios;

            $scope.selectedItem = {};

            $scope.toggle = scope => {
                scope.toggle();
            };
        }

    }
}