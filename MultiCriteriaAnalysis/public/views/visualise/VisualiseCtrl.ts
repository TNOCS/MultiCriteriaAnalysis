module Visualise {
    export interface IVisualiseScope extends ng.IScope {
        vm: VisualiseCtrl;
    }

    export class VisualiseCtrl {
        private project: Models.McaProject;

        public static $inject = [
            '$scope',
            'userService',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope: IVisualiseScope,
            public userService: Services.UserService,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            if (projectService.project == null) return;
            this.project = projectService.project;

            this.initialize();
        }

        private initialize() {
            
        }

    }
}