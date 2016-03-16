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
        public subSubCriterias: Models.Criteria[] = [];
        public modules: Models.Criteria[] = [];
        public selectedMainCriterion: Models.Criteria;
        public selectedSubCriterion: Models.Criteria;
        public selectedSubSubCriterion: Models.Criteria;

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
            this.subSubCriterias.forEach(s => prefs[s.title] = s.userWeight);
            this.modules.forEach(s => prefs[s.title] = s.userWeight);

            this.userService.save();
            this.showingActualValues = false;
            this.messageBus.notify('Saved preferences', 'You have successfully saved the actual preferences and made them your own.');
        }

        private initialize() {
            // this.project.scenarios.forEach(s => {
            //     this.initScenarios(s);
            // });
            this.scenarios = this.project.scenarios;

            this.project.criterias.forEach(main => {
                if (this.mainCriterias.indexOf(main) < 0) this.mainCriterias.push(main);
            });
            if (this.mainCriterias.length === 0) return;
            this.updateSubCriterias(this.mainCriterias[0]);
        }

        public updateSubCriterias(crit: Models.Criteria) {
            this.selectedMainCriterion   = crit;
            this.subCriterias            = [];
            this.subSubCriterias         = [];
            this.selectedSubCriterion    = null;
            this.selectedSubSubCriterion = null;
            this.modules                 = [];
            crit.subCriterias.forEach(sub => {
                if (this.subCriterias.indexOf(sub) < 0) this.subCriterias.push(sub);
            });
            if (this.subCriterias.length === 0) return;
            this.updateSubSubCriterias(this.subCriterias[0]);
         }
         
         public updateSubSubCriterias(crit: Models.Criteria) {
            this.selectedSubCriterion    = crit;
            this.selectedSubSubCriterion = null;
            this.subSubCriterias         = [];
            this.modules                 = [];
            if (crit.subCriterias.length === 0) {
                this.selectedSubCriterion = null;
                return;
            } else if (crit.subCriterias.length !== 0 && crit.subCriterias[0].subCriterias.length === 0) {
                this.updateModules(crit);
            } else {
                crit.subCriterias.forEach(subSub => {
                    if (this.subSubCriterias.indexOf(subSub) < 0) this.subSubCriterias.push(subSub);
                });
                if (this.subSubCriterias.length === 0) return;
                this.selectedSubSubCriterion = this.subSubCriterias[0];
                this.updateModules(this.subSubCriterias[0]);
            }
         }

         public updateModules(sub: Models.Criteria) {
             this.modules = [];
             sub.subCriterias.forEach(m => {
                 if (this.modules.indexOf(m) < 0) this.modules.push(m);
             });
         }

        private initScenarios(scenario: Models.Scenario) {
            scenario.subScenarios.forEach(s => {
                if (s.subScenarios && s.subScenarios.length === 0) {
                    this.scenarios.push(s);
                } else {
                    this.initScenarios(s);
                }
            });
        }

        /**
         * Reset the current user weights and replace them with the user's weights
         * @method resetPreferences
         */
        private resetPreferences() {
            var user = this.userService.activeUser;
            this.scenarios.forEach(s => s.userWeight = user.getUserWeight(s.title));
            this.mainCriterias.forEach(s => { s.userWeight = user.getUserWeight(s.title); s.isEnabled = (s.userWeight > 0); });
            this.subCriterias.forEach(s => { s.userWeight = user.getUserWeight(s.title); s.isEnabled = (s.userWeight > 0); });
            this.subSubCriterias.forEach(s => { s.userWeight = user.getUserWeight(s.title); s.isEnabled = (s.userWeight > 0); });
            this.modules.forEach(s => { s.userWeight = user.getUserWeight(s.title); s.isEnabled = (s.userWeight > 0); });
            this.showingActualValues = false;
            this.messageBus.notify('Reset preferences', 'You have successfully reset the actual preferences with your own.');
        }
    }
}
