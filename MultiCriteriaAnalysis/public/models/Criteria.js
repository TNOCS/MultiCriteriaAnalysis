var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Models;
(function (Models) {
    var CriteriaOption = (function () {
        function CriteriaOption() {
            this.id = Helpers.Utils.createGuid();
        }
        CriteriaOption.prototype.fromJson = function (data) {
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.value = data.value;
        };
        Object.defineProperty(CriteriaOption.prototype, "fullTitle", {
            get: function () {
                return this.title + ' (' + this.value + ')';
            },
            enumerable: true,
            configurable: true
        });
        return CriteriaOption;
    })();
    Models.CriteriaOption = CriteriaOption;
    var Criteria = (function () {
        function Criteria(data) {
            var _this = this;
            this.userWeight = 1;
            this.subCriterias = [];
            this.options = [];
            this.isEnabled = true;
            this.canHaveOptions = function () {
                return _this.subCriterias.length === 0;
            };
            this.canHaveSubs = function () {
                return _this.options.length === 0;
            };
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }
        Criteria.prototype.fromJson = function (data) {
            var _this = this;
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.userWeight = data.userWeight;
            this.dataSourceId = data.dataSourceId;
            if (typeof data.isEnabled === 'undefined' || data.isEnabled == null)
                this.isEnabled = true;
            else
                this.isEnabled = data.isEnabled;
            this.calculateWeights();
            data.subCriterias.forEach(function (d) {
                var criteria = new Criteria();
                criteria.fromJson(d);
                _this.subCriterias.push(criteria);
            });
            data.options.forEach(function (d) {
                var option = new CriteriaOption();
                option.fromJson(d);
                _this.options.push(option);
            });
        };
        Criteria.prototype.hasOptions = function () {
            return this.options.length > 0;
        };
        Criteria.prototype.hasSubcriteria = function () {
            return this.subCriterias.length > 0;
        };
        Criteria.prototype.getOptionValueById = function (id) {
            for (var k in this.options) {
                if (!this.options.hasOwnProperty(k))
                    continue;
                var option = this.options[k];
                if (option.id === id)
                    return option.value;
            }
            return 0;
        };
        Criteria.prototype.sortOptions = function (sortAscending) {
            this.options = this.options.sort(function (o1, o2) {
                return sortAscending
                    ? o1.value - o2.value
                    : o2.value - o1.value;
            });
        };
        Criteria.prototype.addOption = function (title, value) {
            var option = new CriteriaOption();
            option.title = title;
            option.value = value;
            this.options.push(option);
            return option;
        };
        Criteria.prototype.addSubCriteria = function (subCriteria) {
            this.subCriterias.push(subCriteria);
        };
        Criteria.prototype.calculateWeights = function () {
            var totalWeight = 0;
            if (this.subCriterias.length === 0 || !this.isEnabled)
                return;
            this.subCriterias.forEach(function (c) {
                if (c.isEnabled)
                    totalWeight += c.userWeight;
            });
            if (totalWeight == 0)
                return;
            this.subCriterias.forEach(function (c) {
                if (c.isEnabled)
                    c.weight = c.userWeight / totalWeight;
                if (c.subCriterias.length > 0)
                    c.calculateWeights();
            });
        };
        Criteria.prototype.findParent = function (project) {
            var subs = project.criterias;
            if (subs.length == 0)
                return null;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) {
                    var root = new Models.Criteria();
                    root.subCriterias = subs;
                    return root;
                }
                var parent = this.findParentRecursively(sub);
                if (parent != null)
                    return parent;
            }
            return null;
        };
        Criteria.prototype.findParentRecursively = function (parent) {
            var subs = parent.subCriterias;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this)
                    return parent;
                if (sub.subCriterias.length > 0)
                    return this.findParentRecursively(sub);
            }
            return null;
        };
        return Criteria;
    })();
    Models.Criteria = Criteria;
    var SelectableCriterion = (function (_super) {
        __extends(SelectableCriterion, _super);
        function SelectableCriterion(criterion, selectedId, parentWeight) {
            _super.call(this);
            this.criterion = criterion;
            this.selectedId = selectedId;
            this.id = criterion.id;
            this.title = criterion.title;
            this.description = criterion.description;
            this.userWeight = criterion.userWeight;
            this.weight = criterion.weight * parentWeight;
            this.options = criterion.options;
        }
        return SelectableCriterion;
    })(Models.Criteria);
    Models.SelectableCriterion = SelectableCriterion;
})(Models || (Models = {}));
