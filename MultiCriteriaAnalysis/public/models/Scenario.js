var Models;
(function (Models) {
    var Scenario = (function () {
        function Scenario() {
            var _this = this;
            this.subScenarios = [];
            this.effectedCriteriaIds = [];
            this.hasSubs = function () {
                return _this.subScenarios.length > 0;
            };
            this.id = Helpers.Utils.createGuid();
        }
        Scenario.prototype.calculateWeights = function () {
            var totalWeight = 0;
            if (this.subScenarios.length === 0)
                return;
            this.subScenarios.forEach(function (c) {
                totalWeight += c.userWeight;
            });
            if (totalWeight == 0)
                return;
            this.subScenarios.forEach(function (c) {
                c.weight = c.userWeight / totalWeight;
            });
        };
        return Scenario;
    })();
    Models.Scenario = Scenario;
})(Models || (Models = {}));
//# sourceMappingURL=Scenario.js.map
