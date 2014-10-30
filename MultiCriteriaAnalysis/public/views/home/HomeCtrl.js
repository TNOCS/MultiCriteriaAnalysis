var Home;
(function (Home) {
    var HomeCtrl = (function () {
        function HomeCtrl($scope, messageBus, projectService) {
            this.$scope = $scope;
            this.messageBus = messageBus;
            this.projectService = projectService;
            $scope.vm = this;
        }
        HomeCtrl.$inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];
        return HomeCtrl;
    })();
    Home.HomeCtrl = HomeCtrl;
})(Home || (Home = {}));
//# sourceMappingURL=HomeCtrl.js.map
