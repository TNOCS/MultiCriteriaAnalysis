module Comparisons {
    export interface IComparisonsViewScope extends ng.IScope {
        vm: ComparisonsCtrl;
        selectedItem: any;
        toggle: Function;
    }

    export class ComparisonsCtrl {
        public solutions       : Models.Solution[];
        public altSolutions    : Models.Solution[] = [];
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
            this.scenarios = projectService.project.scenarios;

            $scope.selectedItem = {};

            $scope.toggle = scope => {
                scope.toggle();
            };

            if (projectService.activeSolution == null) {
                projectService.activeSolution = this.solutions.length > 0
                ? this.solutions[this.solutions.length - 1]
                : null;
            }
            this.solutions.forEach((s) => {
                if (s.id !== projectService.activeSolution.id) this.altSolutions.push(s);
            });
            if (projectService.compareToSolutions.length === 0) {
                if (this.altSolutions.length > 1)
                    projectService.compareToSolutions.push(this.altSolutions[this.altSolutions.length - 1]);
            } else {
                var i = projectService.compareToSolutions.indexOf(projectService.activeSolution);
                if (i >= 0) projectService.compareToSolutions.slice(i, 1);
            }

            if (!projectService.activeScenario) return;
            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(() => this.select(projectService.activeScenario), 0);
        }

        select(item: Models.Scenario) {
            //var data = {
            //    labels: [
            //        'resilience', 'maintainability', 'accessibility',
            //        'uptime', 'functionality', 'impact'
            //    ],
            //    series: [
            //        {
            //            label: 'serie 1',
            //            values: [4, 8, 15, 16, 23, 42]
            //        },
            //        {
            //            label: 'serie 2',
            //            values: [12, 43, 22, 11, 73, 25]
            //        },
            //        {
            //            label: 'serie 3',
            //            values: [31, 28, 14, 8, 15, 21]
            //        }, ]
            //};
            //Helpers.Utils.drawHorizontalGroupedBarChart(data, 300, 20, 10, 250, 150);

            this.selectedScenario = item;
            this.projectService.activeScenario = item;
            this.activeCriterias = [];
            if (!this.selectedScenario.hasSubs()) {
                this.eachCriteria(this.projectService.project.criterias);
            }
            this.updateResult();
        }

        compareTo() {

        }

        private updateResult() {
            //var data = [];

            var scenario = this.selectedScenario;
            var data = new Helpers.GroupedBarChartData();

            if (scenario.hasSubs()) {

            } else {
                var scores = this.projectService.activeSolution.scores;
                var i = 0;
                data.series[i] = { label: '', values: [] };
                data.series[i].label = this.projectService.activeSolution.title;
                data.series[i].values = [];
                this.activeCriterias.forEach(c => {
                    data.labels.push(c.title);
                    data.series[0].values.push(c.getOptionValueById(c.selectedId) * 100);
                });
                this.projectService.compareToSolutions.forEach(s => {
                    i++;
                    data.series[i] = { label: '', values: [] };
                    data.series[i].label = s.title;
                    data.series[i].values = new Array<number>(this.activeCriterias.length);
                    var scenarioResults = s.scores[scenario.id];
                    for (var critId in scenarioResults) {
                        if (!scenarioResults.hasOwnProperty(critId)) continue;
                        var index = -1;
                        for (var k = 0; k < this.activeCriterias.length; k++) {
                            if (this.activeCriterias[k].criterion.id !== critId) continue;
                            index = k;
                            break;
                        }
                        if (index < 0) break;
                        var v = scenarioResults[critId].value;
                        data.series[i].values[index] = 100 * v;
                    }
                });
                Helpers.Utils.drawHorizontalGroupedBarChart(data, 300, 20, 10, 250, 150);
            }
            //var parent = this.selectedScenario.findParent(this.projectService.project);
            //for (var k = 0; k < parent.subScenarios.length; k++) {
            //    var scenario = parent.subScenarios[k];
            //    data.push({
            //        id: k + 1,
            //        order: k + 1,
            //        color: Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
            //        weight: scenario.weight,
            //        score: this.projectService.activeSolution.computeScore(scenario) * 100,
            //        width: scenario.weight,
            //        label: scenario.title
            //    });
            //}

            //if (data.length > 0)
            //    Helpers.Utils.drawAsterPlot(data);
            //else
            //    Helpers.Utils.clearSvg();
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