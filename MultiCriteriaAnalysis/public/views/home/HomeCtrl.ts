module Home {
    export interface IHomeScope extends ng.IScope {
        vm: HomeCtrl;
    }


    export class HomeCtrl {
        public projects: Models.McaProject[];

        public static $inject = [
            '$scope',
            '$modal',
            '$log',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope        : IHomeScope,
            private $modal        : any,
            private $log        : ng.ILogService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            $scope.vm = this;

            this.projects = projectService.projects;
        }

        public deleteDataSource(dataSource: Models.DataSource) {
            var index = this.projectService.project.dataSources.indexOf(dataSource);
            if (index < 0) return;
            this.projectService.project.dataSources.splice(index, 1);
        }

        public createNewDataSource() {
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: () => "Create new data source"
                }
            });

            modalInstance.result.then((title: string) => {
                if (!title) return;
                var dataSource = new Models.DataSource();
                dataSource.title = title;
                this.projectService.project.dataSources.push(dataSource);
                this.$log.info(this.projectService.project.dataSources);
            }, () => {
                this.$log.error('Modal dismissed at: ' + new Date());
            });
        }

        public deleteProject() {
            var index = this.projectService.projects.indexOf(this.projectService.project);
            if (index < 0) return;
            this.projectService.projects.splice(index, 1);
            this.projectService.project = null;
        }

        public createNewProject() {
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm', // = small or 'lg' for large
                resolve: {
                    header: () => "Create a new project"
                }
            });

            modalInstance.result.then((title: string) => {
                if (!title) return;
                var project = new Models.McaProject();
                project.title = title;
                this.projectService.projects.push(project);
                this.projectService.project = project;
                this.$log.info(this.projectService.project);
            }, () => {
                    this.$log.error('Modal dismissed at: ' + new Date());
                });
        }

    }
}