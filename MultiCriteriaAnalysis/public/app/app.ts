module App {
    'use strict';

    export interface IAppLocationService extends ng.ILocationService {
        $$search: { layers: string };
    }

    export interface IAppScope extends ng.IScope {
        vm: AppCtrl;
        toggleChildren: Function;
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
            '$rootScope',
            '$scope',
            '$location',
            'projectService',
            'messageBusService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $rootScope: any,
            private $scope: IAppScope,
            private $location: IAppLocationService,
            private projectService: Services.ProjectService,
            private $messageBusService: csComp.Services.MessageBusService
        ) {
            //console.log('$location: ' + JSON.stringify($location));
            //console.log('$$search : ' + JSON.stringify($location.$$search));
            //console.log('layers   : ' + JSON.stringify($location.$$search.layers));

            sffjs.setCulture('nl-NL');

            $scope.vm = this;

            $messageBusService.subscribe('project', () => {
                // NOTE EV: You may run into problems here when calling this inside an angular apply cycle.
                // Alternatively, check for it or use (dependency injected) $timeout.
                // E.g. if (this.$scope.$root.$$phase != '$apply' && this.$scope.$root.$$phase != '$digest') { this.$scope.$apply(); }
                $scope.$apply();
            });

            $scope.toggleChildren = function(data) {
                data.childrenVisible = !data.childrenVisible;
                data.folderClass = data.childrenVisible ? 'fa-folder-open' : 'fa-folder';
            };

            // When the location changes, save the projects
            $rootScope.$on('$locationChangeStart', function(next, last) {
                projectService.save();
            });

            $messageBusService.notify('Welcome', 'You can create your own multi-criteria analysis: create categories, define scenarios, and specify the results.');
        }

        public isActive(viewLocation: string) {
            return viewLocation === this.$location.path();
        }
    }

    // Start the application
    angular.module('mca', [
        'csComp',
        'ui.router',
        'ui.bootstrap',
        'LocalStorageModule',
        'csWeb.resize',
        'multi-select',
        'ngSanitize',
        'wiz.markdown',
        //'angularUtils.directives.dirPagination',
        'ui.tree' // https           ://github.com/JimLiu/angular-ui-tree
    ])
        .config(localStorageServiceProvider => {
            localStorageServiceProvider.prefix = 'MultiCriteriaAnalysis';
        })
        .config(($stateProvider, $urlRouterProvider) => {
            // For any unmatched url, send to /
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
        .controller('GetTitleDialogCtrl', DialogCtrls.GetTitleDialogCtrl)
        .controller('ConfirmationDialogCtrl', DialogCtrls.ConfirmationDialogCtrl)
        .controller('ChooseDecisionTreeDialogCtrl', DialogCtrls.ChooseDecisionTreeDialogCtrl)
        .filter('format', [
            '$filter', '$locale', (filter, locale) => (value, format) => String.format(format, value)
        ])
        .filter('cut', function() {
            return function(value, wordwise, max, tail) {
                if (!value) return '';

                max = parseInt(max, 10);
                if (!max) return value;
                if (value.length <= max) return value;

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
        .directive('contenteditable', () => {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: (scope, element: JQuery, attrs: any, ngModel) => {
                    //if (!ngModel) return; // do nothing if no ng-model
                    function read() {
                        var html = element.html();
                        // When we clear the content editable the browser leaves a <br> behind
                        // If strip-br attribute is provided then we strip this out
                        if (attrs.stripBr && html === '<br>') {
                            html = '';
                        }
                        ngModel.$setViewValue(html);
                        //ngModel.$setViewValue(element.html().replace(/<br[^>]*>/g, ''));
                    }

                    ngModel.$render = () => {
                        let emptyText = (attrs.isDescription) ? 'Add description' : '...';
                        element.html(ngModel.$viewValue || emptyText);
                    };

                    element.keydown(e => {
                        if (e.keyCode !== 13) return;
                        e.preventDefault();
                        e.stopPropagation();
                    });

                    element.bind('blur keyup change', () => {
                        //scope.$evalAsync(read);
                        scope.$apply(read);
                    });
                    //read();
                }
            };
        });
}
