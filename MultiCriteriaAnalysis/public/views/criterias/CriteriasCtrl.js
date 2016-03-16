var Criterias;
(function (Criterias) {
    var CriteriasCtrl = (function () {
        function CriteriasCtrl($scope, $modal, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.$modal = $modal;
            this.messageBus = messageBus;
            this.projectService = projectService;
            $scope.vm = this;
            $scope.reorder = false;
            $scope.sortAscending = false;
            $scope.allCollapsed = false;
            $scope.selectedItem = {};
            $scope.options = {};
            $scope.remove = function (scope) {
                scope.remove();
            };
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            $scope.newSubCriteria = function (scope) {
                var parent = scope.$modelValue;
                var subCriteria = new Models.Criteria(parent.level + 1);
                subCriteria.title = parent.title + '.' + (parent.subCriterias.length + 1);
                subCriteria.userWeight = 1;
                parent.subCriterias.push(subCriteria);
            };
            $scope.newOption = function (scope) {
                var parent = scope.$modelValue;
                var o = new Models.CriteriaOption();
                o.title = 'New Option';
                o.value = 1;
                parent.options.push(o);
            };
            $scope.newCriteria = function () {
                var c = new Models.Criteria(1);
                c.title = 'New Criteria';
                _this.projectService.project.criterias.push(c);
            };
            $scope.addSystem = function (parent) {
                if (!_this.projectService.project.components || _this.projectService.project.components.length === 0)
                    return;
                var rootComp = _this.projectService.project.components[0];
                var c = new Models.Criteria(parent.level + 1);
                c.title = rootComp.title;
                c.id = Helpers.Utils.createGuid();
                c.componentId = rootComp.id;
                parent.subCriterias.push(c);
            };
            $scope.collapseAll = function () {
                _this.$scope.allCollapsed = !_this.$scope.allCollapsed;
                var nodes = document.getElementsByClassName("angular-ui-tree-node");
                for (var i = 0; i < nodes.length; i++) {
                    if (_this.$scope.allCollapsed) {
                        angular.element(nodes[i]).scope().collapse();
                    }
                    else {
                        angular.element(nodes[i]).scope().expand();
                    }
                }
            };
            $scope.addComponent = function (parent) {
                if (!_this.projectService.project.components || _this.projectService.project.components.length === 0)
                    return;
                var rootComp = _this.projectService.project.components[0];
                if (!rootComp.components || rootComp.components.length === 0)
                    return;
                if (parent.subCriterias.length === 0) {
                    rootComp.components.forEach(function (comp) {
                        var c = new Models.Criteria(parent.level + 1);
                        c.title = comp.title;
                        c.id = Helpers.Utils.createGuid();
                        c.componentId = comp.id;
                        parent.subCriterias.push(c);
                    });
                }
                else {
                    rootComp.components.filter(function (component) {
                        var found = false;
                        parent.subCriterias.some(function (crit) {
                            if (crit.componentId === component.id) {
                                found = true;
                                return true;
                            }
                            return false;
                        });
                        return !found;
                    }).forEach(function (comp) {
                        var c = new Models.Criteria(parent.level + 1);
                        c.title = comp.title;
                        c.id = Helpers.Utils.createGuid();
                        c.componentId = comp.id;
                        parent.subCriterias.push(c);
                    });
                }
            };
            this.projectService.project.updateCriteriaWeights();
        }
        CriteriasCtrl.prototype.deleteOption = function (option, criteria) {
            Helpers.Utils.deleteDialog(this.$modal, 'Delete option', 'Are you sure you want to delete the option \'' + option.title + '\'?', function (ok) {
                if (!ok)
                    return;
                var options = criteria.options;
                var index = options.indexOf(option);
                if (index < 0)
                    return;
                options.splice(index, 1);
            });
        };
        CriteriasCtrl.prototype.deleteCriteria = function (criteria, parent) {
            var _this = this;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete criteria', 'Are you sure you want to delete the criteria \'' + criteria.title + '\'?', function (ok) {
                if (!ok)
                    return;
                var criterias = parent == null
                    ? _this.projectService.project.criterias
                    : parent.subCriterias;
                var index = criterias.indexOf(criteria);
                if (index < 0)
                    return;
                criterias.splice(index, 1);
            });
        };
        CriteriasCtrl.prototype.chooseDecisionTree = function (item) {
            Helpers.Utils.chooseDecisionTreeDialog(this.$modal, 'Choose decision tree', 'Decision tree: ', this.projectService.project.decisionTrees || [], item.decisionTreeId, function (treeId) {
                if (!treeId || treeId === '')
                    return;
                item.decisionTreeId = treeId;
            });
        };
        CriteriasCtrl.prototype.setFocus = function (id) {
            var el = document.getElementById(id);
            if (el) {
                setTimeout(function () { el.focus(); }, 0);
            }
        };
        CriteriasCtrl.prototype.setEnabled = function (item) {
            if (!item)
                return;
            if (item.isEnabled && (!item.userWeight || item.userWeight === 0)) {
                item.userWeight = 1;
            }
        };
        CriteriasCtrl.prototype.update = function () {
            this.projectService.project.updateCriteriaWeights();
            this.select(this.selectedCriteria);
        };
        CriteriasCtrl.prototype.select = function (item) {
            if (!item) {
                item = new Models.Criteria(0);
                item.title = 'Top level overview';
                item.subCriterias = this.projectService.project.criterias;
            }
            this.selectedCriteria = item;
            var data = [];
            var parent = this.selectedCriteria.findParent(this.projectService.project);
            if (parent == null)
                parent = this.selectedCriteria;
            parent.calculateWeights();
            for (var k in parent.subCriterias) {
                var criteria = parent.subCriterias[k];
                if (!criteria.isEnabled)
                    continue;
                data.push({
                    id: k + 1,
                    order: k + 1,
                    color: Helpers.Utils.pieColors(k % Helpers.Utils.pieColors.range().length),
                    weight: criteria.weight,
                    score: 100,
                    width: criteria.weight,
                    label: criteria.title
                });
            }
            if (data.length > 0) {
                Helpers.Utils.drawPie(data);
            }
            else {
                Helpers.Utils.clearSvg();
            }
        };
        CriteriasCtrl.prototype.sortOptions = function (criterias, sortDirection) {
            var _this = this;
            criterias.forEach(function (c) {
                if (c.hasOptions())
                    c.sortOptions(sortDirection);
                if (c.hasSubcriteria())
                    _this.sortOptions(c.subCriterias, sortDirection);
            });
        };
        CriteriasCtrl.$inject = [
            '$scope',
            '$modal',
            'messageBusService',
            'projectService'
        ];
        return CriteriasCtrl;
    }());
    Criterias.CriteriasCtrl = CriteriasCtrl;
})(Criterias || (Criterias = {}));
