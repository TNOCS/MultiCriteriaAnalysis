﻿module Scenarios {
    export interface IScenariosViewScope extends ng.IScope {
        vm                  : ScenariosCtrl;
        options             : any;
        remove              : Function;
        toggle              : Function;
        newSubScenario      : Function;
        //newSubScenario    : Function;
        reorder             : boolean;
        newCriteria         : Function
        newOption           : Function;
        removeOption        : Function;
        multiSelectOptions  : any;
        clicked             : Function;
    }

    export class ScenariosCtrl {
        public selectedItem: Models.Scenario;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: IScenariosViewScope,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            $scope.clicked = (data) => { 
                console.log(JSON.stringify(data, null, 2));
                this.selectedItem.effectedCriteriaIds = [];
                for (var k in $scope.multiSelectOptions) {
                    var item = $scope.multiSelectOptions[k];
                    if (item.ticked) this.selectedItem.effectedCriteriaIds.push(item.id);
                }
                console.log(this.selectedItem.effectedCriteriaIds);
            }

            $scope.reorder = false;

            $scope.$on('$viewContentLoaded', function() {
                (<any>$('.multiselect')).multiselect();
            });

            $scope.remove = function(scope) {
                scope.remove();
            };

            $scope.toggle = function(scope) {
                scope.toggle();
            };

            $scope.newSubScenario = (scope) => {
                var scenario = <Models.Scenario>scope.$modelValue;
                var s = new Models.Scenario();
                s.title = scenario.title + '.' + (scenario.subScenarios.length + 1);
                s.userWeight = 1;
                scenario.subScenarios.push(s);
            };

            $scope.newCriteria = () => {
                var c = new Models.Criteria();
                c.title = "New Scenario";
                c.userWeight = 1;
                this.projectService.project.criterias.push(c);
            };

        }

        public select(item: Models.Scenario) {
            this.selectedItem = item;
            var multiSelectOptions: any[] = [];
            this.eachCriteria(multiSelectOptions, this.projectService.project.criterias);
            this.$scope.multiSelectOptions = multiSelectOptions;
        }

        private eachCriteria(multiSelectOptions: any[], criterias: Models.Criteria[]) {
            for (var k in criterias) {
                var criteria: Models.Criteria = criterias[k];
                if (criteria.hasSubcriteria()) {
                    multiSelectOptions.push(new CriteriaSelectorNode(criteria.title, true));
                    this.eachCriteria(multiSelectOptions, criteria.subCriterias);
                    multiSelectOptions.push(new CriteriaSelectorNode('', false));
                } else {
                    multiSelectOptions.push(new CriteriaSelectorLeaf(criteria.id, criteria.title, this.selectedItem.isSelectedCriteria(criteria.id)));
                }
            }
        }

        public updateSelectedCriterias(data: any) {
        }
    }

    export class CriteriaSelectorLeaf {
        constructor(public id: string, public title: string, public ticked: boolean) {}
    }

    export class CriteriaSelectorNode {
        constructor(public title: string, public multiSelectGroup: boolean) {}
    }
}