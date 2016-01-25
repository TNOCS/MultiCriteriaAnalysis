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
            $scope.selectedItem = {};
            $scope.options = {};
            $scope.remove = function (scope) {
                scope.remove();
            };
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            $scope.newSubCriteria = function (scope) {
                var criteria = scope.$modelValue;
                var c = new Models.Criteria();
                c.title = criteria.title + '.' + (criteria.subCriterias.length + 1);
                c.userWeight = 1;
                criteria.subCriterias.push(c);
            };
            $scope.newOption = function (scope) {
                var criteria = scope.$modelValue;
                var o = new Models.CriteriaOption();
                o.title = 'New Option';
                o.value = 1;
                criteria.options.push(o);
            };
            $scope.newCriteria = function () {
                var c = new Models.Criteria();
                c.title = 'New Criteria';
                _this.projectService.project.criterias.push(c);
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
        CriteriasCtrl.prototype.update = function () {
            this.projectService.project.updateCriteriaWeights();
            this.select(this.selectedCriteria);
        };
        CriteriasCtrl.prototype.select = function (item) {
            if (!item) {
                item = new Models.Criteria();
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
            if (data.length > 0)
                Helpers.Utils.drawPie(data);
            else
                Helpers.Utils.clearSvg();
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
    })();
    Criterias.CriteriasCtrl = CriteriasCtrl;
})(Criterias || (Criterias = {}));
