var App;
(function (App) {
    'use strict';
    var AppCtrl = (function () {
        function AppCtrl($rootScope, $scope, $location, projectService, $messageBusService) {
            this.$rootScope = $rootScope;
            this.$scope = $scope;
            this.$location = $location;
            this.projectService = projectService;
            this.$messageBusService = $messageBusService;
            sffjs.setCulture('nl-NL');
            $scope.vm = this;
            $messageBusService.subscribe('project', function () {
                $scope.$apply();
            });
            $scope.toggleChildren = function (data) {
                data.childrenVisible = !data.childrenVisible;
                data.folderClass = data.childrenVisible ? 'fa-folder-open' : 'fa-folder';
            };
            $rootScope.$on('$locationChangeStart', function (next, last) {
                projectService.save();
            });
            $messageBusService.notify('Welcome', 'You can create your own multi-criteria analysis: create categories, define scenarios, and specify the results.');
        }
        AppCtrl.prototype.isActive = function (viewLocation) {
            return viewLocation === this.$location.path();
        };
        AppCtrl.$inject = [
            '$rootScope',
            '$scope',
            '$location',
            'projectService',
            'messageBusService'
        ];
        return AppCtrl;
    }());
    App.AppCtrl = AppCtrl;
    angular.module('mca', [
        'csComp',
        'ui.router',
        'ui.bootstrap',
        'LocalStorageModule',
        'csWeb.resize',
        'multi-select',
        'ngSanitize',
        'wiz.markdown',
        'ui.tree'
    ])
        .config(function (localStorageServiceProvider) {
        localStorageServiceProvider.prefix = 'MultiCriteriaAnalysis';
    })
        .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider
            .state('home', {
            url: '/home',
            templateUrl: 'views/home/home.html',
            sticky: true,
            deepStateRedirect: true
        })
            .state('criterias', {
            url: '/criterias',
            templateUrl: 'views/criterias/criterias.html',
            sticky: true,
            deepStateRedirect: true
        })
            .state('scenarios', {
            url: '/scenarios',
            templateUrl: 'views/scenarios/scenarios.html',
            sticky: true
        })
            .state('comparisons', {
            url: '/comparisons',
            templateUrl: 'views/comparisons/comparisons.html',
            sticky: true
        })
            .state('solutions', {
            url: '/solutions',
            templateUrl: 'views/solutions/solutions.html',
            sticky: true
        })
            .state('visualise', {
            url: '/visualise',
            templateUrl: 'views/visualise/visualise.html',
            sticky: true
        })
            .state('user', {
            url: '/user',
            templateUrl: 'views/users/users.html',
            sticky: true
        });
    })
        .service('messageBusService', csComp.Services.MessageBusService)
        .service('projectService', Services.ProjectService)
        .service('userService', Services.UserService)
        .controller('appCtrl', AppCtrl)
        .controller('HomeCtrl', Home.HomeCtrl)
        .controller('ScenariosCtrl', Scenarios.ScenariosCtrl)
        .controller('CriteriasCtrl', Criterias.CriteriasCtrl)
        .controller('SolutionsCtrl', Solutions.SolutionsCtrl)
        .controller('ComparisonsCtrl', Comparisons.ComparisonsCtrl)
        .controller('UsersCtrl', Users.UsersCtrl)
        .controller('VisualiseCtrl', Visualise.VisualiseCtrl)
        .controller('GetTitleDialogCtrl', DialogCtrls.GetTitleDialogCtrl)
        .controller('ConfirmationDialogCtrl', DialogCtrls.ConfirmationDialogCtrl)
        .controller('NewSolutionDialogCtrl', DialogCtrls.NewSolutionDialogCtrl)
        .controller('ChooseDecisionTreeDialogCtrl', DialogCtrls.ChooseDecisionTreeDialogCtrl)
        .filter('format', [
        '$filter', '$locale', function (filter, locale) { return function (value, format) { return String.format(format, value); }; }
    ])
        .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value)
                return '';
            max = parseInt(max, 10);
            if (!max)
                return value;
            if (value.length <= max)
                return value;
            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                    value = value.substr(0, lastspace);
                }
            }
            return value + (tail || ' …');
        };
    })
        .directive('contenteditable', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function read() {
                    var html = element.html();
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
                ngModel.$render = function () {
                    var emptyText = '...';
                    element.html(ngModel.$viewValue || emptyText);
                };
                element.keydown(function (e) {
                    if (e.keyCode !== 13)
                        return;
                    e.preventDefault();
                    e.stopPropagation();
                });
                element.bind('blur keyup change', function () {
                    scope.$apply(read);
                });
            }
        };
    });
})(App || (App = {}));
