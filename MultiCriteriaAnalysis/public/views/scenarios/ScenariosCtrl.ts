module Scenarios {
    export interface IScenariosViewScope extends ng.IScope {
        vm                  : ScenariosCtrl;
        options             : any;
        remove              : Function;
        toggle              : Function;
        newSubScenario      : Function;
        addModuleSubScenarios: Function;
        //newSubScenario    : Function;
        reorder             : boolean;
        allCollapsed        : boolean;
        newScenario         : Function
        newOption           : Function;
        removeOption        : Function;
        //multiSelectOptions  : any;
        clicked             : Function;
        collapseAll         : Function;
    }

    export class ScenariosCtrl {
        public selectedScenario: Models.Scenario;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$modal',
            '$timeout',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope        : IScenariosViewScope,
            private $modal        : any,
            private $timeout      : ng.ITimeoutService,
            private messageBus    : csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
            // for its methods to be accessible from view / HTML
            $scope.vm = this;

            //$scope.clicked = (data) => {
            //    console.log(JSON.stringify(data, null, 2));
            //    this.selectedItem.effectedCriteriaIds = [];
            //    for (var k in $scope.multiSelectOptions) {
            //        var item = $scope.multiSelectOptions[k];
            //        if (item.ticked) this.selectedItem.effectedCriteriaIds.push(item.id);
            //    }
            //    console.log(this.selectedItem.effectedCriteriaIds);
            //}

            $scope.reorder = false;
            $scope.allCollapsed = false;

            $scope.$on('$viewContentLoaded', function() {
                (<any>$('.multiselect')).multiselect();
            });

            $scope.remove = function(scope) {
                scope.remove();
            };

            $scope.toggle = function(scope) {
                scope.toggle();
            };
            
            $scope.addModuleSubScenarios = (scope) => {
                var scenario = <Models.Scenario>scope.$modelValue;
                var system = this.projectService.project.components;
                var components;
                if (system && system.length > 0) {
                    components = system[0].components;
                }
                components.forEach((c) => {
                    var s = new Models.Scenario();
                    s.title = scenario.title + ' ' + (c.title);
                    s.componentId = c.id;
                    s.userWeight = 1;
                    scenario.subScenarios.push(s);
                })
            };

            $scope.newSubScenario = (scope) => {
                var scenario = <Models.Scenario>scope.$modelValue;
                var s = new Models.Scenario();
                s.title = scenario.title + '.' + (scenario.subScenarios.length + 1);
                s.userWeight = 1;
                scenario.subScenarios.push(s);
            };

            $scope.newScenario = () => {
                var scenario = new Models.Scenario();
                scenario.title = "New Scenario";
                this.projectService.project.scenarios.push(scenario);
            };
            
            
            $scope.collapseAll = () => {
                this.$scope.allCollapsed = !this.$scope.allCollapsed;
                var nodes = document.getElementsByClassName("angular-ui-tree-node");
                for (let i = 0; i < nodes.length; i++) {
                    if (this.$scope.allCollapsed) {
                        (<any>angular.element(nodes[i]).scope()).collapse();
                    } else {
                        (<any>angular.element(nodes[i]).scope()).expand();
                    }
                }
            }

            if (!projectService.activeScenario) return;

            this.projectService.project.updateScenarioWeights();

            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(() => this.select(projectService.activeScenario), 0);
        }

        deleteScenario(scenario: Models.Scenario, parent: Models.Scenario) {
            var project = this.projectService.project;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete scenario', 'Are you sure you want to delete the scenario \'' + scenario.title + '\'?', (ok) => {
                if (!ok) return;
                var scenarios = parent == null
                    ? this.projectService.project.scenarios
                    : parent.subScenarios;
                var index = scenarios.indexOf(scenario);
                if (index < 0) return;
                scenarios.splice(index, 1);
                if (this.$scope.$root.$$phase != '$apply' && this.$scope.$root.$$phase != '$digest') { this.$scope.$apply(); }
            });
        }

        select(item: Models.Scenario) {
            if (!item) {
                // Create a pseudo criteria that is the level
                item              = new Models.Scenario();
                item.title        = "Top level scenario";
                item.subScenarios = this.projectService.project.scenarios;
            }
            this.selectedScenario = item;
            this.projectService.activeScenario = item;
            //var multiSelectOptions: any[] = [];
            //this.eachCriteria(multiSelectOptions, this.projectService.project.criterias);
            //this.$scope.multiSelectOptions = multiSelectOptions;

            var data = [];
            var parent = this.selectedScenario.findParent(this.projectService.project);
            if (parent === null) return;
            parent.calculateWeights();
            for (var k in parent.subScenarios) {
                var scenario = parent.subScenarios[k];
                data.push({
                    id    : k + 1,
                    order : k + 1,
                    color : Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: scenario.weight,
                    score : 100,
                    width : scenario.weight,
                    label : scenario.title
                });
            }

            if (data.length > 0)
                Helpers.Utils.drawPie(data);
            else
                Helpers.Utils.clearSvg();
        }
    }

    export class CriteriaSelectorLeaf {
        constructor(public id: string, public title: string, public ticked: boolean) {}
    }

    export class CriteriaSelectorNode {
        constructor(public title: string, public multiSelectGroup: boolean) {}
    }
}
