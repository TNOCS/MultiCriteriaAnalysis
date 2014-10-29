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
            this.subCriterias = [];
            this.options = [];
            this.id = Helpers.Utils.createGuid();
        }
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
        };
        return Criteria;
    })();
    Models.Criteria = Criteria;
})(Models || (Models = {}));
//# sourceMappingURL=Criteria.js.map
