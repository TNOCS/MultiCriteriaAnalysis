module Services {
    export class UserService {
        private static store = 'UserStore';

        public activeUser: Models.User;
        private userStore: Models.User[] = [];

        public static $inject = [
            'localStorageService',
            'projectService'
        ];


        constructor(
            private localStorageService: ng.localStorage.ILocalStorageService,
            private projectService: ProjectService
        ) {
            console.log(`Active project ${projectService.project.title}`);

            this.userStore = localStorageService.get(UserService.store);
            this.setActiveUser();

            // TODO Retreive list of users from local storage: create default user if non found
            // this.userStore.push(new Models.User('Jan'));
            // this.userStore.push(new Models.User('Piet'));
            // this.userStore.push(new Models.User('Klaas'));

            // TODO Retreive active user from local storage, or use the first one
            this.activeUser = this.userStore[0];
        }

        get users() {
            return this.userStore;
        }

        private setActiveUser(user?: Models.User) {
            if (!this.userStore) this.userStore = [];
            if (this.userStore.length === 0) {
                this.userStore.push(new Models.User('Unknown'));
                this.save();
            }
            this.activeUser = user || this.userStore[0];
        }

        private save() {
            this.localStorageService.set(UserService.store, this.userStore);
        }

        public deleteUser(user?: Models.User) {
            if (!user) user = this.activeUser;
            var index = this.userStore.indexOf(user);
            if (index >= 0) this.userStore.splice(index, 1);
            this.setActiveUser();
        }

        public addUser() {
            this.activeUser = new Models.User('Unknown');
            this.userStore.push(this.activeUser);
        }

    }
}
