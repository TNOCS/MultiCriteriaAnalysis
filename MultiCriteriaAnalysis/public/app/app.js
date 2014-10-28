var App;
(function (App) {
    'use strict';

    var AppCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function AppCtrl($scope, $location, $messageBusService) {
            this.$scope = $scope;
            this.$location = $location;
            this.$messageBusService = $messageBusService;
            //console.log('$location: ' + JSON.stringify($location));
            //console.log('$$search : ' + JSON.stringify($location.$$search));
            //console.log('layers   : ' + JSON.stringify($location.$$search.layers));
            sffjs.setCulture("nl-NL");

            $scope.vm = this;

            $messageBusService.subscribe("project", function () {
                // NOTE EV: You may run into problems here when calling this inside an angular apply cycle.
                // Alternatively, check for it or use (dependency injected) $timeout.
                // E.g. if (this.$scope.$root.$$phase != '$apply' && this.$scope.$root.$$phase != '$digest') { this.$scope.$apply(); }
                $scope.$apply();
            });

            $messageBusService.notify('Welcome', 'You can create your own multi-criteria analysis: create categories, define scenarios, and specify the results.');
        }
        AppCtrl.$inject = [
            '$scope',
            '$location',
            'messageBusService'
        ];
        return AppCtrl;
    })();
    App.AppCtrl = AppCtrl;

    

    // Start the application
    angular.module('mca', [
        'ui.router',
        'ui.bootstrap',
        'LocalStorageModule',
        'angularUtils.directives.dirPagination'
    ]).config(function (localStorageServiceProvider) {
        localStorageServiceProvider.prefix = 'MultiCriteriaAnalysis';
    }).config(function ($stateProvider, $urlRouterProvider) {
        // For any unmatched url, send to /
        $urlRouterProvider.otherwise("/categories");
        $stateProvider.state('categories', {
            url: "/categories",
            templateUrl: "views/categories/categories.html",
            sticky: true,
            deepStateRedirect: true
        }).state('scenarios', {
            url: "/scenarios",
            template: "",
            sticky: true
        }).state('results', {
            url: "/results",
            template: "",
            sticky: true
        });
    }).controller('appCtrl', AppCtrl).controller('CategoriesCtrl', Categories.CategoriesCtrl).service('messageBusService', csComp.Services.MessageBusService).filter('format', [
        '$filter', '$locale', function (filter, locale) {
            return function (value, format) {
                return String.format(format, value);
            };
        }
    ]).directive('ngModelOnblur', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            priority: 1,
            link: function (scope, elm, attr, ngModelCtrl) {
                if (attr.type === 'radio' || attr.type === 'checkbox')
                    return;
                elm.unbind('input').unbind('keydown').unbind('change');
                elm.bind('blur', function () {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(elm.val());
                    });
                });
            }
        };
    });
})(App || (App = {}));
//# sourceMappingURL=app.js.map
