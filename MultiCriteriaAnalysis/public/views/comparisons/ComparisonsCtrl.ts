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
        public activeCriterias : Models.SelectableCriterion[] = [];

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
            private $scope: IComparisonsViewScope,
            private $modal: any,
            private $log: ng.ILogService,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            this.solutions = projectService.project.solutions;
            this.scenarios = projectService.project.scenarios;

            $scope.selectedItem = {};

            $scope.toggle = scope => {
                scope.toggle();
            };

            if (this.projectService.activeSolution == null) {
                this.projectService.activeSolution = this.solutions.length > 0
                ? this.solutions[this.solutions.length - 1]
                : null;
            }
            if (this.projectService.altSolution == null) {
                this.projectService.altSolution = this.solutions.length > 1
                ? this.solutions[this.solutions.length - 2]
                : null;
            }
        }

        select(item: Models.Scenario) {
            this.selectedScenario = item;
            this.projectService.activeScenario = item;
            this.activeCriterias = [];
            if (!this.selectedScenario.hasSubs()) {
                this.eachCriteria(this.projectService.project.criterias);
            }
            this.updateResult();
        }

        private updateResult() {
            var data = [];
            var parent = this.selectedScenario.findParent(this.projectService.project);
            for (var k = 0; k < parent.subScenarios.length; k++) {
                var scenario = parent.subScenarios[k];
                data.push({
                    id: k + 1,
                    order: k + 1,
                    color: Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: scenario.weight,
                    score: this.projectService.activeSolution.computeScore(scenario) * 100,
                    width: scenario.weight,
                    label: scenario.title
                });
            }

            if (data.length > 0)
                Helpers.Utils.drawAsterPlot(data);
            else
                Helpers.Utils.clearSvg();
        }

        private eachCriteria(criterias: Models.Criteria[], parentWeight = 1, activeScenario = this.selectedScenario) {
            var scores = this.projectService.activeSolution.scores;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (!criteria.isEnabled) continue;
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias, parentWeight * criteria.weight, activeScenario);
                } else {
                    var selectedId = '';
                    if (activeScenario.id in scores &&
                        criteria.id in scores[activeScenario.id]) {
                        selectedId = scores[activeScenario.id][criteria.id].criteriaOptionId;
                    }
                    this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                }
            }
        }

    }
}