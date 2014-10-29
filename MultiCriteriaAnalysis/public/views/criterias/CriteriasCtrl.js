var Criterias;
(function (Criterias) {
    var CriteriasCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function CriteriasCtrl($scope, messageBus, projectService) {
            this.$scope = $scope;
            this.messageBus = messageBus;
            this.projectService = projectService;
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            console.log('CriteriasCtrl');

            console.log(JSON.stringify(projectService.project, null, 2));
        }
        CriteriasCtrl.$inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];
        return CriteriasCtrl;
    })();
    Criterias.CriteriasCtrl = CriteriasCtrl;
})(Criterias || (Criterias = {}));
//# sourceMappingURL=CriteriasCtrl.js.map
