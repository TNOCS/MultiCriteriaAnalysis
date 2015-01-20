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
            '$http',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope        : IHomeScope,
            private $modal        : any,
            private $log          : ng.ILogService,
            private $http         : ng.IHttpService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            $scope.vm = this;

            this.projects = projectService.projects;
        }

        public deleteDataSource(dataSource: Models.DataSource) {
            Helpers.Utils.deleteDialog(this.$modal, 'Delete source', 'Are you sure you want to delete the data source \'' + dataSource.title  + '\'?', (ok) => {
                if (!ok) return;
                var index = this.projectService.project.dataSources.indexOf(dataSource);
                if (index < 0) return;
                this.projectService.project.dataSources.splice(index, 1);
                for (var k in this.projectService.project.criterias) {
                    var criteria = this.projectService.project.criterias[k];
                    if (criteria.dataSourceId === dataSource.id) criteria.dataSourceId = '';
                }
            });
        }

        public createNewDataSource() {
            var modalInstance = this.$modal.open({
                templateUrl    : 'views/dialogs/getTitleDialog.html',
                controller     : 'GetTitleDialogCtrl',
                size           : 'sm',
                resolve        : {
                    header     : () => "Create new data source",
                    title      : () => '',
                    description: () => ''
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

        public editDataSource(dataSource: Models.DataSource) {
            var modalInstance = this.$modal.open({
                templateUrl     : 'views/dialogs/getTitleDialog.html',
                controller      : 'GetTitleDialogCtrl',
                size            : 'sm',
                resolve         : {
                    header      : () => "Edit data source",
                    title       : () => dataSource.title,
                    description : () => ''
                }
            });

            modalInstance.result.then((title: string) => {
                if (!title) return;
                dataSource.title = title;
                this.$log.info(this.projectService.project.dataSources);
            }, () => {
                    this.$log.error('Modal dismissed at: ' + new Date());
                });
        }

        public deleteProject() {
            var project = this.projectService.project;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete project', 'Are you sure you want to delete the project \'' + project.title + '\'?', (ok) => {
                if (!ok) return;
                var index = this.projectService.projects.indexOf(project);
                if (index < 0) return;
                this.projectService.projects.splice(index, 1);
                project = null;
            });
        }

        public createNewProject() {
            var modalInstance = this.$modal.open({
                templateUrl    : 'views/dialogs/getTitleDialog.html',
                controller     : 'GetTitleDialogCtrl',
                size           : 'sm', // = small or 'lg' for large
                resolve        : {
                    header     : () => "Create a new project",
                    title      : () => '',
                    description: () => ''
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

        public editProject() {
            var project = this.projectService.project;
            var modalInstance = this.$modal.open({
                templateUrl    : 'views/dialogs/getTitleDialog.html',
                controller     : 'GetTitleDialogCtrl',
                size           : 'sm',
                resolve        : {
                    header     : () => "Edit project",
                    title      : () => project.title,
                    description: () => ''
                }
            });

            modalInstance.result.then((title: string) => {
                if (!title) return;
                project.title = title;
                this.$log.info(this.projectService.project);
            }, () => {
                    this.$log.error('Modal dismissed at: ' + new Date());
                });
        }

        public downloadProject() {
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title.replace(/ /g, '_') + '.json';
            var projectAsJson = JSON.stringify(this.projectService.project);
            this.saveData(projectAsJson, filename);
        }

        private saveData(data: string, filename: string) {
            if (navigator.msSaveBlob) {
                // IE 10+
                var link: any = document.createElement('a');
                link.addEventListener("click", event => {
                    var blob = new Blob([data], { "type": "text/csv;charset=utf-8;" });
                    navigator.msSaveBlob(blob, filename);
                }, false);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (!this.supportsDataUri()) {
                // Older versions of IE: show the data in a new window
                var popup = window.open('', 'json', '');
                popup.document.body.innerHTML = '<pre>' + data + '</pre>';
            } else {
                // Support for browsers that support the data uri.
                var a: any = document.createElement('a');
                document.body.appendChild(a);
                a.href = 'data:text/json;charset=utf-8,' + encodeURI(data);
                a.target = '_blank';
                a.download = filename;
                a.click();
                document.body.removeChild(a);
            }
        }

        private supportsDataUri() {
            var isOldIE = navigator.appName === "Microsoft Internet Explorer";
            var isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
            return !(isOldIE || isIE11);  //Return true if not any IE
        }

        public uploadProject(files: any) {
            console.log(JSON.stringify(files));

            var reader = new FileReader();
            var f = files[0];

            reader.onload = e => {
                //var projectData: Models.McaProject = JSON.parse(reader.result);
                var project = new Models.McaProject(JSON.parse(reader.result));
                this.projectService.projects.push(project);
                this.projectService.project = project;
                //$('#uploadFile').val('');
            }

            reader.readAsText(f);
        }
    }
}