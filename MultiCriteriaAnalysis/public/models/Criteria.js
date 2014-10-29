var Models;
(function (Models) {
    var CriteriaOption = (function () {
        function CriteriaOption(title, value) {
            this.title = title;
            this.value = value;
            //this.id = Helpers.Utils.createGuid();
        }
        return CriteriaOption;
    })();
    Models.CriteriaOption = CriteriaOption;

    var Criteria = (function () {
        function Criteria() {
            this.options = [];
        }
        Criteria.prototype.addOption = function (title, value) {
            this.options.push(new CriteriaOption(title, value));
        };
        return Criteria;
    })();
    Models.Criteria = Criteria;
})(Models || (Models = {}));
//# sourceMappingURL=Criteria.js.map
