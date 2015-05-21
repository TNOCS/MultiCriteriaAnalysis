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
        public criteria           : { title: string; criterion: Models.Criteria }[] = [];
        public activeCriterion    : Models.Criteria;
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
            //this.createScenarioTree(projectService.project.rootAndIndependentScenario);
            this.createCriteriaTree(projectService.project.rootCriterion);

            $scope.selectedItem = this.criteria[0];

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

            this.projectService.project.updateScores();

            if (!projectService.activeScenario)
                projectService.activeScenario = projectService.project.rootScenario;
            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(() => this.select(projectService.activeCriteria), 0);
        }

        private createCriteriaTree(criterion: Models.Criteria, indent = 0) {
            this.criteria.push({
                title: this.spaces(indent) + criterion.title,
                criterion: criterion
            });
            if (criterion.hasSubcriteria()) {
                criterion.subCriterias.forEach(c => {
                    this.createCriteriaTree(c, indent + 2);
                });
            }
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

        select(criterion: Models.Criteria = this.activeCriterion) {
            this.activeCriterion = criterion;
            if (criterion == null) return;
            this.projectService.activeCriteria = criterion;
            // this.activeCriterias = [];
            // if (!this.activeCriterion.hasSubcriteria()) {
            //     this.eachCriteria(this.projectService.project.criterias);
            // }
            this.updateResult();
        }

        /** Compute the data set for the bar chart. */
        private updateResult() {
            var criterion = this.activeCriterion;
            var solution = this.projectService.activeSolution;
            var data = new Helpers.GroupedBarChartData();
            data.series[0] = { label: solution.title, values: [] };

            if (criterion.hasSubcriteria()) {
                criterion.subCriterias.forEach(c => {
                    data.labels.push(c.title.toUpperCase());
                    data.series[0].values.push(this.getScaledScore(solution, c));
                });
                var i = 1;
                this.projectService.compareToSolutions.forEach(sol => {
                    data.series[i] = { label: sol.title, values: [] };
                    criterion.subCriterias.forEach(s => {
                        data.series[i].values.push(this.getScaledScore(sol, s));
                    });
                    i++;
                });
                this.addResultsToData(data, criterion, true);
            } else {
                data.labels.push(criterion.title.toUpperCase());
                data.series[0].values.push(this.getScaledScore(solution, criterion));
                var i = 1;
                this.projectService.compareToSolutions.forEach(sol => {
                    data.series[i] = { label: sol.title, values: [] };
                    data.series[i].values.push(this.getScaledScore(sol, criterion));
                    i++;
                });
                //this.addResultsToData(data, criterion, true);

                // this.activeCriterias.forEach(c => {
                //     var optionValue = c.getOptionValueById(c.selectedId);
                //     data.labels.push(c.title);
                //     data.series[0].values.push(optionValue * 100);
                // });
                // var i = 0;
                // // Add the compared solutions to the data.
                // this.projectService.compareToSolutions.forEach(s => {
                //     i++;
                //     var scores = s.scores[criterion.id];
                //     data.series[i] = { label: s.title, values: [] };
                //     this.activeCriterias.forEach(c => {
                //         var result = scores.hasOwnProperty(c.id) ? c.getOptionValueById(scores[c.id].criteriaOptionId) * 100 : 0;
                //         data.series[i].values.push(result);
                //     });
                // });
                //
                // this.addResultsToData(data, criterion, true);
            }
            Helpers.Utils.drawHorizontalGroupedBarChart(data, 300, 20, 20, 300, 150);
        }

        /** Scale and round the score. */
        private getScaledScore(solution: Models.Solution, criterion: Models.Criteria) {
            return Math.round(solution.computeScore(criterion) * 100)
        }

        /**
         * Add results to the data.
         */
        private addResultsToData(data: Helpers.GroupedBarChartData, criterion: Models.Criteria, atStart = false) {
            var title = criterion.title.toUpperCase();
            var score = this.getScaledScore(this.projectService.activeSolution, criterion);
            if (atStart) {
                data.labels.unshift(title);
                data.series[0].values.unshift(score);
            } else {
                data.labels.push(title);
                data.series[0].values.push(score);
            }
            var i = 1;
            this.projectService.compareToSolutions.forEach(s => {
                var score = Math.round(s.computeScore(criterion) * 100);
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
            this.select(this.activeCriterion);
        }

        private eachCriteria(criterias: Models.Criteria[], parentWeight = 1, activeCriterion = this.activeCriterion) {
            var scores = this.projectService.activeSolution.scores;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (!criteria.isEnabled) continue;
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias, parentWeight * criteria.weight, criteria);
                } else {
                    var selectedId = '';
                    if (criteria.id in scores) {
                        if (!activeCriterion.isScenarioDependent) {
                            if (!scores[criteria.id].hasOwnProperty("0")) return;
                            selectedId = scores[activeCriterion.id]["0"].criteriaOptionId;
                            this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                        } else {
                            this.projectService.project.scenarios.forEach(s => {
                                if (!scores[criteria.id].hasOwnProperty(s.id)) return;
                                selectedId = scores[activeCriterion.id][s.id].criteriaOptionId;
                                this.activeCriterias.push(new Models.SelectableCriterion(criteria, selectedId, parentWeight));
                            });
                        }
                    }
                }
            }
        }

    }
}
