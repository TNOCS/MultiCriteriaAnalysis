module Solutions {
    export interface ISolutionsViewScope extends ng.IScope {
        vm: SolutionsCtrl;
        selectedItem: any;
        toggle: Function;
    }

    export class SolutionsCtrl {
        public solutions  : Models.Solution[];
        public dataSources: Models.DataSource[];
        public scenarios: Models.Scenario[];
        public selectedItem: Models.Scenario;
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
            this.dataSources = projectService.project.dataSources;
            this.scenarios   = projectService.project.scenarios;

            console.log('SolutionsCtrl');

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
            this.projectService.activeSolution.scores[this.selectedItem.id][criteria.id] = {
                criteriaOptionId: criteria.selectedId,
                value: criteria.getOptionValueById(criteria.selectedId)
            };
        }

        public select(item: Models.Scenario) {
            //console.log(JSON.stringify(item, null, 2));
            this.selectedItem = item;
            this.activeCriterias = [];
            this.eachCriteria(this.projectService.project.criterias);
            //this.$scope.multiSelectOptions = multiSelectOptions;
        }

        private eachCriteria(criterias: Models.Criteria[]) {
            var activeScenario = this.selectedItem;
            for (var k in criterias) {
                var criteria: Models.Criteria = criterias[k];
                if (criteria.hasSubcriteria()) {
                    this.eachCriteria(criteria.subCriterias);
                } else if (activeScenario.isSelectedCriteria(criteria.id)) {
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
        constructor(private criterion: Models.Criteria, public selectedId?: string) {
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