module Comparisons {
    export interface IComparisonsViewScope extends ng.IScope {
        vm: ComparisonsCtrl;
        selectedItem: any;
        toggle: Function;
    }

    export class ComparisonsCtrl {
        public solutions          : Models.Solution[];
        public compareToSolutions : Models.Solution[] = [];
        public dataSources        : Models.DataSourceViewModel[];
        public scenarios          : { title: string; scenario: Models.Scenario }[] = [];
        public selectedScenario   : Models.Scenario;
        public activeCriterias    : Models.SelectableCriterion[] = [];

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$modal',
            '$timeout',
            '$log',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope        : IComparisonsViewScope,
            private $modal        : any,
            private $timeout      : ng.ITimeoutService,
            private $log          : ng.ILogService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            this.solutions = projectService.project.solutions;
            this.createScenarioTree(projectService.project.rootAndIndependentScenario);
            $scope.selectedItem = this.scenarios[0];

            // $scope.toggle = scope => {
            //     scope.toggle();
            // };

            if (projectService.activeSolution == null) {
                projectService.activeSolution = this.solutions.length > 0
                ? this.solutions[this.solutions.length - 1]
                : null;
            }
            this.solutions.forEach((s) => {
                if (s.id !== projectService.activeSolution.id) this.compareToSolutions.push(s);
            });
            if (projectService.compareToSolutions.length === 0) {
                if (this.compareToSolutions.length > 1)
                    projectService.compareToSolutions.push(this.compareToSolutions[this.compareToSolutions.length - 1]);
            } else {
                var i = projectService.compareToSolutions.indexOf(projectService.activeSolution);
                if (i >= 0) projectService.compareToSolutions.slice(i, 1);
            }

            //$scope.$watch('this.projectService.compareToSolutions', () => { alert('Changed'); this.select(); }, true);

            if (!projectService.activeScenario) return;
            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(() => this.select(projectService.activeScenario), 0);
        }

        private createScenarioTree(scenario: Models.Scenario, indent = 0) {
            this.scenarios.push({
                title: this.spaces(indent) + scenario.title,
                scenario: scenario
            });
            if (scenario.hasSubs()) {
                scenario.subScenarios.forEach(s => {
                    this.createScenarioTree(s, indent + 2);
                });
            }
        }

        /**
         * Return indent number of spaces.
         */
        private spaces(indent = 0) {
            if (indent === 0) return '';
            var result = ' ';
            indent *= 2;
            while (--indent > 0) {
                result += '\u00A0';
            }
            return result;
        }

        changeActiveSolution() {
            this.compareToSolutions = [];
            this.solutions.forEach((s) => {
                if (s.id !== this.projectService.activeSolution.id) this.compareToSolutions.push(s);
            });
            this.select();
        }

        select(scenario: Models.Scenario = this.selectedScenario) {
            this.selectedScenario = scenario;
            if (scenario == null) return;
            this.projectService.activeScenario = scenario;
            this.activeCriterias = [];
            if (!this.selectedScenario.hasSubs()) {
                this.eachCriteria(this.projectService.project.criterias);
            }
            this.updateResult();
        }

        /** Compute the data set for the bar chart. */
        private updateResult() {
            var scenario = this.selectedScenario;
            var solution = this.projectService.activeSolution;
            var data = new Helpers.GroupedBarChartData();
            data.series[0] = { label: solution.title, values: [] };

            if (scenario.hasSubs()) {
                scenario.subScenarios.forEach(s => {
                    data.labels.push(s.title.toUpperCase());
                    data.series[0].values.push(this.getScaledScore(solution, s));
                });
                var i = 1;
                this.projectService.compareToSolutions.forEach(sol => {
                    data.series[i] = { label: sol.title, values: [] };
                    scenario.subScenarios.forEach(s => {
                        data.series[i].values.push(this.getScaledScore(sol, s));
                    });
                    i++;
                });
                this.addScenarioResultsToData(data, scenario, true);
            } else {
                // Add the active solution to the data.
                //var scores = solution.scores;
                this.activeCriterias.forEach(c => {
                    data.labels.push(c.title);
                    data.series[0].values.push(c.getOptionValueById(c.selectedId) * 100);
                });
                var i = 0;
                // Add the compared solutions to the data.
                this.projectService.compareToSolutions.forEach(s => {
                    i++;
                    var scores = s.scores[scenario.id];
                    data.series[i] = { label: s.title, values: [] };
                    this.activeCriterias.forEach(c => {
                        var result = scores.hasOwnProperty(c.id) ? c.getOptionValueById(scores[c.id].criteriaOptionId) * 100 : 0;
                        data.series[i].values.push(result);
                    });
                });

                this.addScenarioResultsToData(data, scenario, true);
            }
            Helpers.Utils.drawHorizontalGroupedBarChart(data, 300, 20, 20, 300, 150);
        }

        /** Scale and round the score. */
        private getScaledScore(solution: Models.Solution, scenario: Models.Scenario) {
            return Math.round(solution.computeScore(scenario) * 100)
        }

        /**
         * Add scenario results to the data.
         */
        private addScenarioResultsToData(data: Helpers.GroupedBarChartData, scenario: Models.Scenario, atStart = false) {
            var title = scenario.title.toUpperCase();
            var score = this.getScaledScore(this.projectService.activeSolution, scenario);
            if (atStart) {
                data.labels.unshift(title);
                data.series[0].values.unshift(score);
            } else {
                data.labels.push(title);
                data.series[0].values.push(score);
            }
            var i = 1;
            this.projectService.compareToSolutions.forEach(s => {
                var score = Math.round(s.computeScore(scenario) * 100);
                if (atStart)
                    data.series[i].values.unshift(score);
                else
                    data.series[i].values.push(score);
                i++;
            });
        }

        /**
         * The data source is changed in the menu.
         */
        dataSourceChanged() {
            this.select(this.selectedScenario);
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
                    if (typeof this.projectService.activeDataSource === 'undefined' || this.projectService.activeDataSource.id === criteria.dataSourceId) {
                        if (activeScenario.id in scores && criteria.id in scores[activeScenario.id]) {
                            selectedId = scores[activeScenario.id][criteria.id].criteriaOptionId;
                            this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                        }
                    }
                }
            }
        }

    }
}
