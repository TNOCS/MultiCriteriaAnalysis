var Criterias;
(function (Criterias) {
    var CriteriasCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function CriteriasCtrl($scope, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.messageBus = messageBus;
            this.projectService = projectService;
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            console.log('CriteriasCtrl');

            console.log(JSON.stringify(projectService.project, null, 2));

            $scope.reorder = false;

            $scope.selectedItem = {};

            $scope.options = {};

            $scope.remove = function (scope) {
                scope.remove();
            };

            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.newSubCriteria = function (scope) {
                var criteria = scope.$modelValue;
                var c = new Models.Criteria();
                c.title = criteria.title + '.' + (criteria.subCriterias.length + 1);
                c.userWeight = 1;
                criteria.subCriterias.push(c);
            };

            $scope.newOption = function (scope) {
                var criteria = scope.$modelValue;
                var o = new Models.CriteriaOption();
                o.title = "New Option";
                criteria.options.push(o);
            };

            $scope.newCriteria = function () {
                var c = new Models.Criteria();
                c.title = "New Criteria";
                c.userWeight = 1;
                _this.projectService.project.criterias.push(c);
            };
        }
        CriteriasCtrl.prototype.select = function (item) {
            if (!item) {
                // Create a pseudo criteria that is the level
                item = new Models.Criteria();
                item.title = "Top level overview";
                item.subCriterias = this.projectService.project.criterias;
            }
            this.selectedItem = item;
            var data = [];
            this.selectedItem.calculateWeights();
            for (var k in this.selectedItem.subCriterias) {
                var criteria = this.selectedItem.subCriterias[k];
                data.push({
                    id: k + 1,
                    order: k + 1,
                    color: Helpers.Utils.pieColors[k % Helpers.Utils.pieColors.length],
                    weight: criteria.weight,
                    score: 100,
                    width: criteria.weight,
                    label: criteria.title
                });
            }

            Helpers.Utils.drawPie(data);
        };
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
