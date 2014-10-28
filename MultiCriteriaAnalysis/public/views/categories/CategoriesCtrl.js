﻿var Categories;
(function (Categories) {
    var CategoriesCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function CategoriesCtrl($scope) {
            this.$scope = $scope;
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;
        }
        CategoriesCtrl.$inject = [
            '$scope',
            'messageBus'
        ];
        return CategoriesCtrl;
    })();
    Categories.CategoriesCtrl = CategoriesCtrl;
})(Categories || (Categories = {}));
//# sourceMappingURL=CategoriesCtrl.js.map