var Solutions;
(function (Solutions) {
    var SolutionsCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function SolutionsCtrl($scope, $modal, $log, messageBus, projectService) {
            this.$scope = $scope;
            this.$modal = $modal;
            this.$log = $log;
            this.messageBus = messageBus;
            this.projectService = projectService;
            $scope.vm = this;

            this.solutions = projectService.project.solutions;

            console.log('SolutionsCtrl');

            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            }
        }
        SolutionsCtrl.prototype.createNewSolution = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/solutions/createSolutionDialog/createSolutionDialog.html',
                controller: 'CreateSolutionDialogCtrl',
                size: 'small'
            });

            modalInstance.result.then(function (title) {
                if (!title)
                    return;
                var solution = new Models.Solution();
                solution.title = title;
                _this.projectService.project.solutions.push(solution);
                _this.projectService.activeSolution = solution;
                _this.$log.info(_this.projectService.project.solutions);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        SolutionsCtrl.$inject = [
            '$scope',
            '$modal',
            '$log',
            'messageBusService',
            'projectService'
        ];
        return SolutionsCtrl;
    })();
    Solutions.SolutionsCtrl = SolutionsCtrl;

    var CreateSolutionDialogCtrl = (function () {
        function CreateSolutionDialogCtrl($scope, $modalInstance) {
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            $scope.vm = this;
        }
        CreateSolutionDialogCtrl.prototype.ok = function () {
            this.$modalInstance.close(this.title);
        };

        CreateSolutionDialogCtrl.prototype.cancel = function () {
            this.$modalInstance.dismiss('cancel');
        };
        CreateSolutionDialogCtrl.$inject = [
            '$scope',
            '$modalInstance'
        ];
        return CreateSolutionDialogCtrl;
    })();
    Solutions.CreateSolutionDialogCtrl = CreateSolutionDialogCtrl;
})(Solutions || (Solutions = {}));
//# sourceMappingURL=SolutionsCtrl.js.map
