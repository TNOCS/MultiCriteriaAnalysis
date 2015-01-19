var App;
(function (App) {
    'use strict';
    var AppCtrl = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function AppCtrl($scope, $location, $messageBusService) {
            //console.log('$location: ' + JSON.stringify($location));
            //console.log('$$search : ' + JSON.stringify($location.$$search));
            //console.log('layers   : ' + JSON.stringify($location.$$search.layers));
            this.$scope = $scope;
            this.$location = $location;
            this.$messageBusService = $messageBusService;
            sffjs.setCulture("nl-NL");
            $scope.vm = this;
            $messageBusService.subscribe("project", function () {
                // NOTE EV: You may run into problems here when calling this inside an angular apply cycle.
                // Alternatively, check for it or use (dependency injected) $timeout.
                // E.g. if (this.$scope.$root.$$phase != '$apply' && this.$scope.$root.$$phase != '$digest') { this.$scope.$apply(); }
                $scope.$apply();
            });
            $scope.toggleChildren = function (data) {
                data.childrenVisible = !data.childrenVisible;
                data.folderClass = data.childrenVisible ? "fa-folder-open" : "fa-folder";
            };
            $messageBusService.notify('Welcome', 'You can create your own multi-criteria analysis: create categories, define scenarios, and specify the results.');
        }
        AppCtrl.prototype.isActive = function (viewLocation) {
            return viewLocation === this.$location.path();
        };
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
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
        'csWeb.resize',
        'multi-select',
        'ui.tree'
    ]).config(function (localStorageServiceProvider) {
        localStorageServiceProvider.prefix = 'MultiCriteriaAnalysis';
    }).config(function ($stateProvider, $urlRouterProvider) {
        // For any unmatched url, send to /
        $urlRouterProvider.otherwise("/home");
        $stateProvider.state('home', {
            url: "/home",
            templateUrl: "views/home/home.html",
            sticky: true,
            deepStateRedirect: true
        }).state('criterias', {
            url: "/criterias",
            templateUrl: "views/criterias/criterias.html",
            sticky: true,
            deepStateRedirect: true
        }).state('scenarios', {
            url: "/scenarios",
            templateUrl: "views/scenarios/scenarios.html",
            sticky: true
        }).state('comparisons', {
            url: "/comparisons",
            templateUrl: "views/comparisons/comparisons.html",
            sticky: true
        }).state('solutions', {
            url: "/solutions",
            templateUrl: "views/solutions/solutions.html",
            sticky: true
        });
    }).service('messageBusService', csComp.Services.MessageBusService).service('projectService', Services.ProjectService).controller('appCtrl', AppCtrl).controller('HomeCtrl', Home.HomeCtrl).controller('ScenariosCtrl', Scenarios.ScenariosCtrl).controller('CriteriasCtrl', Criterias.CriteriasCtrl).controller('SolutionsCtrl', Solutions.SolutionsCtrl).controller('GetTitleDialogCtrl', DialogCtrls.GetTitleDialogCtrl).controller('ConfirmationDialogCtrl', DialogCtrls.ConfirmationDialogCtrl).filter('format', [
        '$filter',
        '$locale',
        function (filter, locale) { return function (value, format) { return String.format(format, value); }; }
    ]).directive("contenteditable", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                function read() {
                    ngModel.$setViewValue(element.html().replace(/<br[^>]*>/g, ""));
                }
                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || "Set title...");
                };
                element.bind("blur keyup change", function () {
                    scope.$apply(read);
                });
            }
        };
    }).directive('ngModelOnblur', function () {
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