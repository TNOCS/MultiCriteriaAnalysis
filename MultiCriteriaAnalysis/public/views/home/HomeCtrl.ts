module Home {
    export interface IHomeScope extends ng.IScope {
        vm: HomeCtrl;
    }


    export class HomeCtrl {
        public static $inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope        : IHomeScope,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            $scope.vm = this;
        }
    }
}