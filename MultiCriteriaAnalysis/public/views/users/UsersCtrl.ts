module Users {
    export interface IUsersViewScope extends ng.IScope {
        vm          : UsersCtrl;
        selectedUser: Models.User;
    }

    export class UsersCtrl {
        public static $inject = [
            '$scope',
            'userService',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope        : IUsersViewScope,
            public  userService   : Services.UserService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            if (projectService.project == null) return;

            // this.projectService.project
            //this.updateWeightsAndScore();

            $scope.selectedUser = userService.activeUser;

            //projectService.project.updateScores();

            if (!projectService.activeScenario) return;
        }

    }
}
