module App {
    'use strict';

    export interface IAppLocationService extends ng.ILocationService {
        $$search: { layers: string };
    }

    export interface IAppScope extends ng.IScope {
        vm: AppCtrl;
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

            $messageBusService.notify('Welcome', 'You can create your own multi-criteria analysis: create categories, define scenarios, and specify the results.');
        }
    }

    // http://jsfiddle.net/mrajcok/pEq6X/
    declare var google;

    // Start the application
    angular.module('mca', [
            'ui.router',
            'ui.bootstrap',
            'LocalStorageModule',
            'angularUtils.directives.dirPagination'
        ])
        .config(localStorageServiceProvider => {
            localStorageServiceProvider.prefix = 'MultiCriteriaAnalysis';
        })
        .config(($stateProvider, $urlRouterProvider) => {
            // For any unmatched url, send to /
            $urlRouterProvider.otherwise("/criterias");
            $stateProvider
                .state('criterias', {
                    url: "/criterias",
                    templateUrl: "views/criterias/criterias.html",
                    sticky: true,
                    deepStateRedirect: true
                })
                .state('scenarios', {
                    url: "/scenarios",
                    template: "",
                    sticky: true
                })
                .state('solutions', {
                    url: "/solutions",
                    template: "",
                    sticky: true
                });
        })
        .controller('appCtrl', AppCtrl)
        .controller('CategoriesCtrl', Categories.CategoriesCtrl)
        .service('messageBusService', csComp.Services.MessageBusService)
        .filter('format', [
            '$filter', '$locale', function(filter, locale) {
                return function(value, format) {
                    return String.format(format, value);
                };
            }
        ])
        .directive('ngModelOnblur', () => {
            return {
                restrict: 'A',
                require: 'ngModel',
                priority: 1, // needed for angular 1.2.x
                link: (scope, elm, attr, ngModelCtrl) => {
                    if (attr.type === 'radio' || attr.type === 'checkbox') return;
                    elm.unbind('input').unbind('keydown').unbind('change');
                    elm.bind('blur', () => {
                        scope.$apply(() => {
                            ngModelCtrl.$setViewValue(elm.val());
                        });
                    });
                }
            };
        });
}