module Solutions {
    export interface ISolutionsViewScope extends ng.IScope {
        vm          : SolutionsCtrl;
        selectedItem: any;
        toggle      : Function;
    }

    export class SolutionsCtrl {
        public solutions      : Models.Solution[];
        public dataSources    : Models.DataSourceViewModel[];
        public scenarios      : Models.Scenario[];
        public selectedItem   : Models.Scenario;
        public activeCriterias: SelectableCriterion[];

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

            this.solutions   = projectService.project.solutions;
            this.scenarios   = projectService.project.scenarios;

            this.initializeDataSources();

            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            } else if (projectService.activeSolution == null) {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }

            $scope.selectedItem = {};

            $scope.toggle = scope => {
                scope.toggle();
            };
        }

        private initializeDataSources() {
            this.dataSources = [];
            this.dataSources.push(new Models.DataSourceViewModel('all', '1', 'Show', (value: SelectableCriterion, idx: number) => { return true; }));
            this.dataSources.push(new Models.DataSourceViewModel('unassigned', '2', 'Show', (value: SelectableCriterion, idx: number) => {
                return (value.selectedId == null || value.selectedId.length === 0);
            }));
            this.projectService.project.dataSources.forEach((ds) => {
                this.dataSources.push(new Models.DataSourceViewModel(ds.title, ds.id, 'Filter by model', (value: SelectableCriterion, idx: number) => {
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

        public deleteSolution() {
            var index = this.projectService.project.solutions.indexOf(this.projectService.activeSolution);
            if (index < 0) return;
            this.projectService.project.solutions.splice(index, 1);
            this.projectService.activeSolution = null;
        }

        public createNewSolution() {
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: () => "Create a new solution"
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

        public updateCriteria(criteria: SelectableCriterion) {
            //console.log(JSON.stringify(criteria, null, 2));
            if (!(this.selectedItem.id in this.projectService.activeSolution.scores)) {
                this.projectService.activeSolution.scores[this.selectedItem.id] = {};
            }
            criteria.calculateWeights();
            this.projectService.activeSolution.scores[this.selectedItem.id][criteria.id] = {
                criteriaOptionId: criteria.selectedId,
                value           : criteria.getOptionValueById(criteria.selectedId),
                weight          : criteria.weight
            };
        }

        public select(item: Models.Scenario) {
            if (!item) {
                // Create a pseudo criteria that is the top level
                item              = new Models.Scenario();
                item.title        = "Top level scenario";
                item.subScenarios = this.projectService.project.scenarios;
            }
            this.selectedItem = item;
            this.activeCriterias = [];
            if (!this.selectedItem.hasSubs()) {
                this.eachCriteria(this.projectService.project.criterias);
            }

            //if (!this.selectedItem.hasSubs()) {
            //    Helpers.Utils.drawAsterPlot();
            //    return;
            //}
            var data = [];
            var parent = this.selectedItem.findParent(this.projectService.project);
            parent.calculateWeights();
            for (var k = 0; k < parent.subScenarios.length; k++) {
                var scenario = parent.subScenarios[k];
                data.push({
                    id    : k + 1,
                    order : k + 1,
                    color : Helpers.Utils.pieColors[k % Helpers.Utils.pieColors.length],
                    weight: scenario.weight,
                    score : this.computeScore(scenario) * 100,
                    width : scenario.weight,
                    label : scenario.title
                });
            }

            //this.fixWeights(data);
            if (data.length > 0)
                Helpers.Utils.drawAsterPlot(data);
            else
                Helpers.Utils.clearSvg();
        }

        public fixWeights(data: any[]) {
            var totalWeight = 0;
            if (data.length === 0) return;
            data.forEach((c) => {
                totalWeight += c.userWeight;
            });
            if (totalWeight == 0) return;
            data.forEach((c) => {
                c.weight = c.userWeight / totalWeight;
            });
        }

        private computeScore(activeScenario: Models.Scenario): number {
            var totalScore = 0;
            if (!activeScenario.hasSubs()) {
                // Leaf node
                if (activeScenario.id in this.projectService.activeSolution.scores) {
                    var score = this.projectService.activeSolution.scores[activeScenario.id];
                    this.projectService.project.criterias.forEach((c) => {
                        var id = c.id;
                        if (id in score) {
                            totalScore += score[id].weight * score[id].value;
                        }
                    });
                }
            } else {
                activeScenario.subScenarios.forEach((s) => {
                    s.calculateWeights();
                    if (s.weight)
                        totalScore += s.weight * this.computeScore(s);
                });
            }
            return totalScore;
        }

        /**
         * Use the selected data source to filter the results.
         */
        dataSourceFilter = (value: SelectableCriterion, idx: number) => {
            if (this.projectService.activeDataSource == null) return true;
            return this.projectService.activeDataSource.filter(value, idx);
        }

        private eachCriteria(criterias: Models.Criteria[]) {
            var activeScenario = this.selectedItem;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias);
                } else {
                    var selectedId = '';
                    if (activeScenario.id in this.projectService.activeSolution.scores &&
                        criteria.id in this.projectService.activeSolution.scores[activeScenario.id]) {
                        selectedId = this.projectService.activeSolution.scores[activeScenario.id][criteria.id].criteriaOptionId;
                    }
                    this.activeCriterias.push(new SelectableCriterion(criteria, selectedId));
                }
            }
        }
    }

    export class SelectableCriterion extends Models.Criteria {
        constructor(public criterion: Models.Criteria, public selectedId?: string) {
            super();
            this.id          = criterion.id;
            this.title       = criterion.title;
            this.description = criterion.description;
            this.userWeight  = criterion.userWeight;
            this.weight      = criterion.weight;
            this.options     = criterion.options;
        }
    }

    export interface IGetTitleDialogScope extends ng.IScope {
        vm: GetTitleDialogCtrl;
        header: string;
    }

    export class GetTitleDialogCtrl {
        public title: string;

        public static $inject = [
            '$scope',
            '$modalInstance',
            'header'
        ];

        constructor(
            private $scope: IGetTitleDialogScope,
            private $modalInstance: any,
            private header: string) {

            $scope.vm = this;
            $scope.header = header;
        }

        public ok() {
            this.$modalInstance.close(this.title);
        }

        public cancel() {
            this.$modalInstance.dismiss('cancel');            
        }
    }
}