module UserHeaderSelection {
    export interface IUserHeaderSelectionScope extends ng.IScope {
        vm: UserHeaderSelectionCtrl;
    }

    export class UserHeaderSelectionCtrl {
        public scope: any;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$modal',
            'userService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: any,
            private $modal: any,
            public userService: Services.UserService
            ) {
            $scope.vm = this;
        }

        public deleteUser(user?: Models.User) {
            console.log('deleteUser called');
            if (!user) user = this.userService.activeUser;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete user', `Do you really want to delete user ${user.name}?`, (ok) => {
                if (!ok) return;
                this.userService.deleteUser(user);
            });
        }


    }
}
