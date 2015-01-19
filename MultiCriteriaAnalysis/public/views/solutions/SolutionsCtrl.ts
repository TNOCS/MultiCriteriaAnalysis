module Solutions {
    export interface ISolutionsViewScope extends ng.IScope {
        vm          : SolutionsCtrl;
        selectedItem: any;
        toggle      : Function;
    }

    export class SolutionsCtrl {
        public solutions        : Models.Solution[];
        public dataSources      : Models.DataSourceViewModel[];
        public scenarios        : Models.Scenario[];
        public selectedScenario : Models.Scenario;
        public activeCriterias  : Models.SelectableCriterion[] = [];

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
            private $scope        : ISolutionsViewScope,
            private $modal        : any,
            private $log          : ng.ILogService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            $scope.vm = this;

            this.solutions  = projectService.project.solutions;
            this.scenarios  = projectService.project.scenarios;

            this.initializeDataSources();
            this.initializeCriteriaWeights();
            this.initializeScenarioWeights();

            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            } else if (projectService.activeSolution == null) {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }
            this.updateWeightsAndScore();

            $scope.selectedItem = {};

            $scope.toggle = scope => {
                scope.toggle();
            };
        }

        private updateWeightsAndScore() {
            this.projectService.project.scenarios.forEach((scenario) => {
                this.eachCriteria(this.projectService.project.criterias, 1, scenario);
            });
            this.activeCriterias = [];
        }

        private initializeDataSources() {
            this.dataSources = [];
            this.dataSources.push(new Models.DataSourceViewModel('all', '1', 'Show', (value: Models.SelectableCriterion, idx: number) => { return true; }));
            this.dataSources.push(new Models.DataSourceViewModel('unassigned', '2', 'Show', (value: Models.SelectableCriterion, idx: number) => {
                return (value.selectedId == null || value.selectedId.length === 0);
            }));
            this.projectService.project.dataSources.forEach((ds) => {
                this.dataSources.push(new Models.DataSourceViewModel(ds.title, ds.id, 'Filter by model', (value: Models.SelectableCriterion, idx: number) => {
                    return value.criterion.dataSourceId === this.projectService.activeDataSource.id;
                }));
            });

            if (this.projectService.activeDataSource != null) {
                var id = this.projectService.activeDataSource.id;
                for (var i = 0; i < this.dataSources.length; i++) {
                    var ds = this.dataSources[i];
                    if (ds.id !== id) continue;
                    this.projectService.activeDataSource = ds;
                    break;
                }
            }
        }

        private initializeCriteriaWeights() {
            this.projectService.project.rootCriterion.calculateWeights();
        }

        private initializeScenarioWeights() {
            var scenario = new Models.Scenario();
            scenario.subScenarios = this.projectService.project.scenarios;
            scenario.calculateWeights();
        }

        // TODO Add confirmation
        public deleteSolution() {
            var index = this.projectService.project.solutions.indexOf(this.projectService.activeSolution);
            if (index < 0) return;
            this.projectService.project.solutions.splice(index, 1);
            this.projectService.activeSolution = null;
        }

        public createNewSolution() {
            var modalInstance = this.$modal.open({
                templateUrl     : 'views/dialogs/getTitleDialog.html',
                controller      : 'GetTitleDialogCtrl',
                size            : 'sm',
                resolve         : {
                    header      : () => 'Create a new solution',
                    title       : () => '',
                    description : () => ''
                }
            });

            modalInstance.result.then((title: string) => {
                if (!title) return;
                var solution = new Models.Solution();
                solution.title = title;
                this.projectService.project.solutions.push(solution);
                this.projectService.activeSolution = solution;
                this.$log.info(this.projectService.project.solutions);
            }, () => {
                this.$log.error('Modal dismissed at: ' + new Date());
            });
        }

        public updateCriteria(criteria: Models.SelectableCriterion) {
            //console.log(JSON.stringify(criteria, null, 2));
            if (!(this.selectedScenario.id in this.projectService.activeSolution.scores)) {
                this.projectService.activeSolution.scores[this.selectedScenario.id] = {};
            }
            criteria.calculateWeights();
            this.projectService.activeSolution.scores[this.selectedScenario.id][criteria.id] = {
                criteriaOptionId: criteria.selectedId,
                value           : criteria.getOptionValueById(criteria.selectedId),
                weight          : criteria.weight
            };
            this.updateResult();
        }

        public select(item: Models.Scenario) {
            if (!item) {
                // Create a pseudo scenario that is the top level
                item              = new Models.Scenario();
                item.title        = "Top level scenario";
                item.subScenarios = this.projectService.project.scenarios;
            }
            this.selectedScenario = item;
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
                    id    : k + 1,
                    order : k + 1,
                    color : Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: scenario.weight,
                    score : this.computeScore(scenario) * 100,
                    width : scenario.weight,
                    label : scenario.title
                });
            }

            if (data.length > 0)
                Helpers.Utils.drawAsterPlot(data);
            else
                Helpers.Utils.clearSvg();
        }

        private computeScore(scenario: Models.Scenario): number {
            var totalScore = 0;
            if (!scenario.hasSubs()) {
                // Leaf node
                if (scenario.id in this.projectService.activeSolution.scores) {
                    var score = this.projectService.activeSolution.scores[scenario.id];
                    for (var criterionId in score) {
                        if (!score.hasOwnProperty(criterionId)) continue;
                        var criteriaScore = score[criterionId];
                        totalScore += criteriaScore.weight * criteriaScore.value;
                    }
                }
            } else {
                scenario.subScenarios.forEach((s) => {
                    s.calculateWeights();
                    if (s.weight)
                        totalScore += s.weight * this.computeScore(s);
                });
            }
            scenario.score = totalScore;
            return totalScore;
        }

        /**
         * Use the selected data source to filter the results.
         */
        dataSourceFilter = (value: Models.SelectableCriterion, idx: number) => {
            if (this.projectService.activeDataSource == null) return true;
            return this.projectService.activeDataSource.filter(value, idx);
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