module Solutions {
    export interface ISolutionsViewScope extends ng.IScope {
        vm: SolutionsCtrl;
        selectedItem: any;
        toggle: Function;
    }

    export class SolutionsCtrl {
        public solutions  : Models.Solution[];
        public dataSources: Models.DataSource[];
        public scenarios  : Models.Scenario[];

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