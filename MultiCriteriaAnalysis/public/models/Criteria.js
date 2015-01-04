var Models;
(function (Models) {
    var CriteriaOption = (function () {
        function CriteriaOption() {
            this.id = Helpers.Utils.createGuid();
        }
        /** Deserialize the object */
        CriteriaOption.prototype.fromJson = function (data) {
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.value = data.value;
        };
        return CriteriaOption;
    })();
    Models.CriteriaOption = CriteriaOption;
    var Criteria = (function () {
        function Criteria(data) {
            var _this = this;
            this.userWeight = 1;
            this.subCriterias = [];
            this.options = [];
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
        /** Deserialize the object */
        Criteria.prototype.fromJson = function (data) {
            var _this = this;
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.userWeight = data.userWeight;
            this.dataSourceId = data.dataSourceId;
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
                var option = this.options[k];
                if (option.id == id)
                    return option.value;
            }
            return 0;
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
            if (this.subCriterias.length === 0)
                return;
            this.subCriterias.forEach(function (c) {
                totalWeight += c.userWeight;
            });
            if (totalWeight == 0)
                return;
            this.subCriterias.forEach(function (c) {
                c.weight = c.userWeight / totalWeight;
            });
        };
        /**
         * Find the parent of the element. Returns null when there is no parent.
         */
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
        /**
         * Find the parent of the element. Returns null when no parent has been found.
         */
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
})(Models || (Models = {}));
//# sourceMappingURL=Criteria.js.map