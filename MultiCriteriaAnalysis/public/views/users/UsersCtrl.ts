module Users {
    export interface IUsersViewScope extends ng.IScope {
        vm: UsersCtrl;
    }

    export class UsersCtrl {
        private project: Models.McaProject;
        /**
         * When opening the page, show the actual values for the user weights.
         * Allow the user to reset them to his preferences, or to copy the actual settings to his preferences.
         * @type {Boolean}
         */
        public showingActualValues = true;
        public scenarios: Models.Scenario[] = [];
        public mainCriterias: Models.Criteria[] = [];
        public subCriterias: Models.Criteria[] = [];
        public modules: Models.Criteria[] = [];

        public static $inject = [
            '$scope',
            'userService',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope: IUsersViewScope,
            public userService: Services.UserService,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            if (projectService.project == null) return;
            this.project = projectService.project;

            this.initialize();
        }

        public save() {
            var prefs = this.userService.activeUser.preferences;
            this.scenarios.forEach(s => prefs[s.title] = s.userWeight);
            this.mainCriterias.forEach(s => prefs[s.title] = s.userWeight);
            this.subCriterias.forEach(s => prefs[s.title] = s.userWeight);
            this.modules.forEach(s => prefs[s.title] = s.userWeight);

            this.userService.save();
            this.showingActualValues = false;
            this.messageBus.notify('Save preferences', 'You have successfully saved the actual preferences and made them your own.');
        }

        private initialize() {
            this.project.scenarios.forEach(s => {
                if (this.scenarios.indexOf(s) < 0) this.scenarios.push(s);
            });

            this.project.criterias.forEach(main => {
                if (this.mainCriterias.indexOf(main) < 0) this.mainCriterias.push(main);
                main.subCriterias.forEach(sub => {
                    if (this.subCriterias.indexOf(sub) < 0) this.subCriterias.push(sub);
                    sub.subCriterias.forEach(m => {
                        if (this.modules.indexOf(m) < 0) this.modules.push(m);
                    });
                });
            });
        }

        /**
         * Reset the current user weights and replace them with the user's weights
         * @method resetPreferences
         */
        private resetPreferences() {
            var user = this.userService.activeUser;
            this.scenarios.forEach(s => s.userWeight = user.getUserWeight(s.title));
            this.mainCriterias.forEach(s => s.userWeight = user.getUserWeight(s.title));
            this.subCriterias.forEach(s => s.userWeight = user.getUserWeight(s.title));
            this.modules.forEach(s => s.userWeight = user.getUserWeight(s.title));
            this.showingActualValues = false;
            this.messageBus.notify('Reset preferences', 'You have successfully reset the actual preferences with your own.');
        }
    }
}
