var Models;
(function (Models) {
    var CriteriaOption = (function () {
        function CriteriaOption() {
            this.id = Helpers.Utils.createGuid();
        }
        return CriteriaOption;
    })();
    Models.CriteriaOption = CriteriaOption;

    var Criteria = (function () {
        function Criteria() {
            var _this = this;
            this.subCriterias = [];
            this.options = [];
            this.canHaveOptions = function () {
                return _this.subCriterias.length === 0;
            };
            this.canHaveSubs = function () {
                return _this.options.length === 0;
            };
            this.id = Helpers.Utils.createGuid();
        }
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
        return Criteria;
    })();
    Models.Criteria = Criteria;
})(Models || (Models = {}));
//# sourceMappingURL=Criteria.js.map
