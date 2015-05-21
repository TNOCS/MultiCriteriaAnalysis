module Criterias {
    export interface ICriteriasViewScope extends ng.IScope {
        vm                : CriteriasCtrl;
        selectedItem      : any;
        options           : any;
        reorder           : boolean;
        sortAscending     : boolean;
        remove            : Function;
        toggle            : Function;
        newSubCriteria    : Function;
        newCriteria       : Function
        newOption         : Function;
        removeOption      : Function;
    }

    export class CriteriasCtrl {
        public selectedCriteria: Models.Criteria;
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$modal',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope        : ICriteriasViewScope,
            private $modal        : any,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
            ) {
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;
            //console.log(JSON.stringify(projectService.project, null, 2));

            $scope.reorder       = false;
            $scope.sortAscending = false;
            $scope.selectedItem  = {};
            $scope.options       = {};

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
                o.value = 1;
                criteria.options.push(o);
            };

            $scope.newCriteria = () => {
                var c = new Models.Criteria();
                c.title = "New Criteria";
                this.projectService.project.criterias.push(c);
            };

            this.projectService.project.updateCriteriaWeights();
        }

        deleteOption(option: Models.CriteriaOption, criteria: Models.Criteria) {
            Helpers.Utils.deleteDialog(this.$modal, 'Delete option', 'Are you sure you want to delete the option \'' + option.title + '\'?', (ok) => {
                if (!ok) return;
                var options = criteria.options;
                var index = options.indexOf(option);
                if (index < 0) return;
                options.splice(index, 1);
            });
        }

        deleteCriteria(criteria: Models.Criteria, parent: Models.Criteria) {
            Helpers.Utils.deleteDialog(this.$modal, 'Delete criteria', 'Are you sure you want to delete the criteria \'' + criteria.title + '\'?', (ok) => {
                if (!ok) return;
                var criterias = parent == null
                    ? this.projectService.project.criterias
                    : parent.subCriterias;
                var index = criterias.indexOf(criteria);
                if (index < 0) return;
                criterias.splice(index, 1);
            });
        }

        update() {
            // var rootCriteria = new Models.Criteria();
            // rootCriteria.subCriterias = this.projectService.project.criterias;
            // rootCriteria.calculateWeights();
            this.projectService.project.updateCriteriaWeights();
            this.select(this.selectedCriteria);
        }

        public select(item: Models.Criteria) {
            if (!item) {
                // Create a pseudo criteria that is the level
                item = new Models.Criteria();
                item.title = "Top level overview";
                item.subCriterias = this.projectService.project.criterias;
            }
            this.selectedCriteria = item;
            var data = [];
            var parent = this.selectedCriteria.findParent(this.projectService.project);
            if (parent == null) parent = this.selectedCriteria;
            parent.calculateWeights();
            for (var k in parent.subCriterias) {
                var criteria = parent.subCriterias[k];
                if (!criteria.isEnabled) continue;
                data.push({
                    id    : k + 1,
                    order : k + 1,
                    color : Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: criteria.weight,
                    score : 100,
                    width : criteria.weight,
                    label : criteria.title
                });
            }

            if (data.length > 0)
                Helpers.Utils.drawPie(data);
            else
                Helpers.Utils.clearSvg();
        }

        sortOptions(criterias, sortDirection: boolean) {
            criterias.forEach((c) => {
                if (c.hasOptions()) c.sortOptions(sortDirection);
                if (c.hasSubcriteria()) this.sortOptions(c.subCriterias, sortDirection);
            });
        }
    }
}
