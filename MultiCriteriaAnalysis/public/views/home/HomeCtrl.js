var Home;
(function (Home) {
    var HomeCtrl = (function () {
        function HomeCtrl($scope, $modal, $log, $http, messageBus, projectService) {
            this.$scope = $scope;
            this.$modal = $modal;
            this.$log = $log;
            this.$http = $http;
            this.messageBus = messageBus;
            this.projectService = projectService;
            $scope.vm = this;
            this.projects = projectService.projects;
        }
        HomeCtrl.prototype.deleteDataSource = function (dataSource) {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/ConfirmationDialog.html',
                controller: 'ConfirmationDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return "Delete source"; },
                    question: function () { return 'Are you sure you want to delete the data source \'' + dataSource.title + '\'?'; }
                }
            });
            modalInstance.result.then(function (confirmation) {
                if (!confirmation)
                    return;
                var index = _this.projectService.project.dataSources.indexOf(dataSource);
                if (index < 0)
                    return;
                _this.projectService.project.dataSources.splice(index, 1);
                for (var k in _this.projectService.project.criterias) {
                    var criteria = _this.projectService.project.criterias[k];
                    if (criteria.dataSourceId === dataSource.id)
                        criteria.dataSourceId = '';
                }
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        HomeCtrl.prototype.createNewDataSource = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return "Create new data source"; },
                    title: function () { return ''; },
                    description: function () { return ''; }
                }
            });
            modalInstance.result.then(function (title) {
                if (!title)
                    return;
                var dataSource = new Models.DataSource();
                dataSource.title = title;
                _this.projectService.project.dataSources.push(dataSource);
                _this.$log.info(_this.projectService.project.dataSources);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        HomeCtrl.prototype.editDataSource = function (dataSource) {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return "Edit data source"; },
                    title: function () { return dataSource.title; },
                    description: function () { return ''; }
                }
            });
            modalInstance.result.then(function (title) {
                if (!title)
                    return;
                dataSource.title = title;
                _this.$log.info(_this.projectService.project.dataSources);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        HomeCtrl.prototype.deleteProject = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/ConfirmationDialog.html',
                controller: 'ConfirmationDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return "Delete project"; },
                    question: function () { return 'Are you sure you want to delete the project \'' + _this.projectService.project.title + '\'?'; }
                }
            });
            modalInstance.result.then(function (confirmation) {
                if (!confirmation)
                    return;
                var index = _this.projectService.projects.indexOf(_this.projectService.project);
                if (index < 0)
                    return;
                _this.projectService.projects.splice(index, 1);
                _this.projectService.project = null;
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        HomeCtrl.prototype.createNewProject = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return "Create a new project"; },
                    title: function () { return ''; },
                    description: function () { return ''; }
                }
            });
            modalInstance.result.then(function (title) {
                if (!title)
                    return;
                var project = new Models.McaProject();
                project.title = title;
                _this.projectService.projects.push(project);
                _this.projectService.project = project;
                _this.$log.info(_this.projectService.project);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        HomeCtrl.prototype.editProject = function () {
            var _this = this;
            var project = this.projectService.project;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return "Edit project"; },
                    title: function () { return project.title; },
                    description: function () { return ''; }
                }
            });
            modalInstance.result.then(function (title) {
                if (!title)
                    return;
                project.title = title;
                _this.$log.info(_this.projectService.project);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        HomeCtrl.prototype.downloadProject = function () {
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title.replace(/ /g, '_') + '.json';
            var projectAsJson = JSON.stringify(this.projectService.project);
            this.saveData(projectAsJson, filename);
        };
        HomeCtrl.prototype.saveData = function (data, filename) {
            if (navigator.msSaveBlob) {
                // IE 10+
                var link = document.createElement('a');
                link.addEventListener("click", function (event) {
                    var blob = new Blob([data], { "type": "text/csv;charset=utf-8;" });
                    navigator.msSaveBlob(blob, filename);
                }, false);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (!this.supportsDataUri()) {
                // Older versions of IE: show the data in a new window
                var popup = window.open('', 'json', '');
                popup.document.body.innerHTML = '<pre>' + data + '</pre>';
            }
            else {
                // Support for browsers that support the data uri.
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.href = 'data:text/json;charset=utf-8,' + encodeURI(data);
                a.target = '_blank';
                a.download = filename;
                a.click();
                document.body.removeChild(a);
            }
        };
        HomeCtrl.prototype.supportsDataUri = function () {
            var isOldIE = navigator.appName === "Microsoft Internet Explorer";
            var isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
            return !(isOldIE || isIE11); //Return true if not any IE
        };
        HomeCtrl.prototype.uploadProject = function (files) {
            var _this = this;
            console.log(JSON.stringify(files));
            var reader = new FileReader();
            var f = files[0];
            reader.onload = function (e) {
                //var projectData: Models.McaProject = JSON.parse(reader.result);
                var project = new Models.McaProject(JSON.parse(reader.result));
                _this.projectService.projects.push(project);
                _this.projectService.project = project;
                //$('#uploadFile').val('');
            };
            reader.readAsText(f);
        };
        HomeCtrl.$inject = [
            '$scope',
            '$modal',
            '$log',
            '$http',
            'messageBusService',
            'projectService'
        ];
        return HomeCtrl;
    })();
    Home.HomeCtrl = HomeCtrl;
})(Home || (Home = {}));
//# sourceMappingURL=HomeCtrl.js.map