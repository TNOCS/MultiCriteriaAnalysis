﻿module App {
    'use strict';

    export interface IAppLocationService extends ng.ILocationService {
        $$search: { layers: string };
    }

    export interface IAppScope extends ng.IScope {
        vm: AppCtrl;
        toggleChildren : Function;
        title: string;
    }

    declare var sffjs; // For setting the current culture for string formatting (note you need to include stringformat.nl-NL.js)
    declare var String;

    export class AppCtrl {
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$location',
            'messageBusService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: IAppScope,
            private $location: IAppLocationService,
            private $messageBusService: csComp.Services.MessageBusService
        ) {
            //console.log('$location: ' + JSON.stringify($location));
            //console.log('$$search : ' + JSON.stringify($location.$$search));
            //console.log('layers   : ' + JSON.stringify($location.$$search.layers));

            sffjs.setCulture("nl-NL");

            $scope.vm = this;

            $messageBusService.subscribe("project", () => {
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

        public isActive(viewLocation: string) {
            return viewLocation === this.$location.path();
        }
    }

    // Start the application
    angular.module('mca', [
        'ui.router',
        'ui.bootstrap',
        'LocalStorageModule',
        'csWeb.resize',
        'multi-select',
        //'angularUtils.directives.dirPagination',
        'ui.tree' // https           ://github.com/JimLiu/angular-ui-tree
        ])
        .config(localStorageServiceProvider => {
            localStorageServiceProvider.prefix = 'MultiCriteriaAnalysis';
        })
        .config(($stateProvider, $urlRouterProvider) => {
            // For any unmatched url, send to /
            $urlRouterProvider.otherwise("/home");
            $stateProvider
                .state('home', {
                    url              : "/home",
                    templateUrl      : "views/home/home.html",
                    sticky           : true,
                    deepStateRedirect: true
                })
                .state('criterias', {
                    url              : "/criterias",
                    templateUrl      : "views/criterias/criterias.html",
                    sticky           : true,
                    deepStateRedirect: true
                })
                .state('scenarios', {
                    url              : "/scenarios",
                    templateUrl      : "views/scenarios/scenarios.html",
                    sticky           : true
                })
                .state('comparisons', {
                    url              : "/comparisons",
                    templateUrl      : "views/comparisons/comparisons.html",
                    sticky           : true
                })
                .state('solutions', {
                    url              : "/solutions",
                    templateUrl      : "views/solutions/solutions.html",
                    sticky           : true
                });

        })
        .service('messageBusService',         csComp.Services.MessageBusService)
        .service('projectService',            Services.ProjectService)
        .controller('appCtrl',                AppCtrl)
        .controller('HomeCtrl',               Home.HomeCtrl)
        .controller('ScenariosCtrl',          Scenarios.ScenariosCtrl)
        .controller('CriteriasCtrl',          Criterias.CriteriasCtrl)
        .controller('SolutionsCtrl',          Solutions.SolutionsCtrl)
        .controller('ComparisonsCtrl',        Comparisons.ComparisonsCtrl)
        .controller('GetTitleDialogCtrl',     DialogCtrls.GetTitleDialogCtrl)
        .controller('ConfirmationDialogCtrl', DialogCtrls.ConfirmationDialogCtrl)
        .filter('format', [
            '$filter', '$locale', (filter, locale) => (value, format) => String.format(format, value)
        ]).directive("contenteditable", () => {
            return {
                restrict: "A",
                require: "ngModel",
                link: (scope, element, attrs, ngModel) => {
                    function read() {
                        ngModel.$setViewValue(element.html().replace(/<br[^>]*>/g, ""));
                    }

                    ngModel.$render = () => {
                        element.html(ngModel.$viewValue || "Set title...");
                    };

                    element.bind("blur keyup change", () => {
                        scope.$apply(read);
                    });
                }
            };
        });

}
