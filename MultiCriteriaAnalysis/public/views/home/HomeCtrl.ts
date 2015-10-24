module Home {
    export interface IHomeScope extends ng.IScope {
        vm: HomeCtrl;
    }

    export interface ISavedProject {
        users: Models.User[],
        project: Models.McaProject
    }

    export class HomeCtrl {
        public projects: Models.McaProject[];

        public static $inject = [
            '$scope',
            '$modal',
            '$log',
            '$http',
            'messageBusService',
            'projectService',
            'userService'
        ];

        constructor(
            private $scope        : IHomeScope,
            private $modal        : any,
            private $log          : ng.ILogService,
            private $http         : ng.IHttpService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService,
            private userService   : Services.UserService
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
            Helpers.Utils.editTextDialog(this.$modal, 'Edit data source', dataSource.title, (newTitle) => {
                if (!newTitle) return;
                dataSource.title = newTitle;
            });
        }

        deleteProject() {
            var project = this.projectService.project;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete project', 'Are you sure you want to delete the project \'' + project.title + '\'?', (ok) => {
                if (!ok) return;
                var index = this.projectService.projects.indexOf(project);
                if (index < 0) return;
                this.projectService.projects.splice(index, 1);
                project = null;
            });
        }

        createExampleProject() {
            this.projectService.createExampleProject();
        }

        createNewProject() {
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
            Helpers.Utils.editTextDialog(this.$modal, 'Edit project', project.title, (newTitle) => {
                if (!newTitle) return;
                project.title = newTitle;
            });
        }

        public downloadProject() {
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title.replace(/ /g, '_') + '.json';
            var savedProject: ISavedProject = {
                users: this.userService.users,
                project: this.projectService.project
            }
            var projectAsJson = JSON.stringify(savedProject);
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
                var result = JSON.parse(reader.result);
                if (!result.hasOwnProperty('users')) {
                    this.projectService.createProject(result);
                } else {
                    this.projectService.createProject(result.project);
                    this.userService.setStore(result.users);
                }
            }

            reader.readAsText(f);
        }
    }
}
