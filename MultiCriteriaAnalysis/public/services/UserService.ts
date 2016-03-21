module Services {
    export class UserService {
        private static store = 'UserStore';
        private static lastUserId = 'LastStore';

        public activeUser: Models.User;
        private userStore: Models.User[] = [];

        public static $inject = [
            '$timeout',
            'localStorageService',
            'projectService'
        ];

        constructor(
            private $timeout: ng.ITimeoutService,
            private localStorageService: ng.local.storage.ILocalStorageService,
            private projectService: ProjectService
        ) {
            var store = <Models.User[]>localStorageService.get(UserService.store);
            if (store && store.length > 0) {
                store.forEach(user => this.userStore.push(new Models.User(user)));
            }
            this.setActiveUser();
        }

        get users() {
            return this.userStore;
        }

        private setActiveUser(user?: Models.User) {
            if (!this.userStore) this.userStore = [];
            if (this.userStore.length === 0) {
                this.userStore.push(new Models.User({ name: 'Unknown' }));
                this.save();
            }
            if (user) {
                this.activeUser = user;
            } else {
                this.activeUser = this.userStore[0];
                // If the lastUserId is set, check for that and it's presence in the store.
                var lastUserId = <string>this.localStorageService.get(UserService.lastUserId);
                if (lastUserId) {
                    this.userStore.some(u => {
                        if (u.id !== lastUserId) return false;
                        this.activeUser = u;
                        return true;
                    });
                }
            }
            this.localStorageService.set(UserService.lastUserId, this.activeUser.id);
            this.initializeActiveUser();
        }

        private initializeActiveUser() {
            var scenarios: Models.Scenario[] = [],
                mainCriterias: Models.Criteria[] = [],
                subCriterias: Models.Criteria[] = [],
                modules: Models.Criteria[] = [];

            var existingTitles: string[] = [];

            this.projectService.project.scenarios.forEach(s => {
                s.subScenarios.forEach(s => this.initScenarios(scenarios, s, existingTitles));
            });

            this.projectService.project.criterias.forEach(main => {
                if (mainCriterias.indexOf(main) >= 0) return;
                mainCriterias.push(main);
                main.userWeight = this.activeUser.getUserWeight(main.title);
                existingTitles.push(main.title);

                main.subCriterias.forEach(sub => {
                    if (subCriterias.indexOf(sub) >= 0) return;
                    subCriterias.push(sub);
                    sub.userWeight = this.activeUser.getUserWeight(sub.title);
                    existingTitles.push(sub.title);

                    sub.subCriterias.forEach(m => {
                        if (modules.indexOf(m) >= 0) return;
                        modules.push(m);
                        m.userWeight = this.activeUser.getUserWeight(m.title);
                        existingTitles.push(m.title);
                    });
                });
            });

            // Remove superfluous IDs in the user
            for (var title in this.activeUser.preferences) {
                if (existingTitles.indexOf(title) >= 0) continue;
                delete this.activeUser.preferences[title];
            }
        }

        private initScenarios(scenarios: Models.Scenario[], scenario: Models.Scenario, existingTitles: string[]) {
            if (scenarios.indexOf(scenario) >= 0) return;
            scenarios.push(scenario);
            scenario.userWeight = this.activeUser.getUserWeight(scenario.title);
            existingTitles.push(scenario.title);
            scenario.subScenarios.forEach(s => this.initScenarios(scenarios, s, existingTitles));
        }

        public save() {
            this.localStorageService.set(UserService.store, this.userStore);
        }

        public setStore(store: any) {
            this.userStore = [];
            store.forEach(u => this.userStore.push(new Models.User(u)));
            this.$timeout(() => this.setActiveUser(), 0);
        }

        public deleteUser(user?: Models.User) {
            if (!user) user = this.activeUser;
            var index = this.userStore.indexOf(user);
            if (index >= 0) this.userStore.splice(index, 1);
            this.setActiveUser();
        }

        public addUser() {
            this.activeUser = new Models.User({ name: 'Unknown' });
            this.userStore.push(this.activeUser);
            this.initializeActiveUser();
        }

    }
}
