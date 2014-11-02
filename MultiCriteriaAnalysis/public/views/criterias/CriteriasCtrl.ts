﻿module Criterias {
    export interface ICriteriasViewScope extends ng.IScope {
        vm                : CriteriasCtrl;
        selectedItem      : any;
        options: any;
        reorder : boolean;
        remove            : Function;
        toggle            : Function;
        newSubCriteria    : Function;
        newCriteria       : Function
        newOption         : Function;
        removeOption      : Function;
    }

    export class CriteriasCtrl {
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
            private $scope: ICriteriasViewScope,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            
            console.log('CriteriasCtrl');
            

            console.log(JSON.stringify(projectService.project, null, 2));

            $scope.reorder = false;

            $scope.selectedItem = {};

            $scope.options = {
            };

            $scope.remove = function (scope) {
                scope.remove();                
            };

            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.newSubCriteria = (scope) => {
                var criteria = <Models.Criteria>scope.$modelValue;                
                var c = new Models.Criteria();
                c.title = criteria.title + '.' + (criteria.subCriterias.length + 1);
                c.userWeight = 1;
                    criteria.subCriterias.push(c);
                    
                
            };

            $scope.newOption = (scope) => {
                var criteria = <Models.Criteria>scope.$modelValue;    
                var o = new Models.CriteriaOption();
                o.title = "New Option";                
                criteria.options.push(o);
            };


            $scope.newCriteria = () => {
                var c = new Models.Criteria();
                c.title = "New Criteria";
                c.userWeight = 1;
                this.projectService.project.criterias.push(c);                
            };
        }
    }
}