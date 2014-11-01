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
            var index = this.projectService.project.dataSources.indexOf(dataSource);
            if (index < 0)
                return;
            this.projectService.project.dataSources.splice(index, 1);
        };

        HomeCtrl.prototype.createNewDataSource = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () {
                        return "Create new data source";
                    }
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

        HomeCtrl.prototype.deleteProject = function () {
            var index = this.projectService.projects.indexOf(this.projectService.project);
            if (index < 0)
                return;
            this.projectService.projects.splice(index, 1);
            this.projectService.project = null;
        };

        HomeCtrl.prototype.createNewProject = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/getTitleDialog.html',
                controller: 'GetTitleDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () {
                        return "Create a new project";
                    }
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

        HomeCtrl.prototype.downloadProject = function () {
            var projectAsJson = JSON.stringify(this.projectService.project);
            var a = document.createElement('a');
            a.href = 'data:text/json;charset=utf-8,' + projectAsJson;
            a.target = '_blank';
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title;
            a.download = filename + '.json';
            document.body.appendChild(a);
            a.click();
        };

        HomeCtrl.prototype.uploadProject = function (files) {
            var _this = this;
            console.log(JSON.stringify(files));

            var reader = new FileReader();
            var f = files[0];

            reader.onload = function (e) {
                var project = JSON.parse(reader.result);
                _this.projectService.projects.push(project);
                _this.projectService.project = project;
                $('#uploadFile').val('');
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
