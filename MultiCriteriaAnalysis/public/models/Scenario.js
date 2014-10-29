var Models;
(function (Models) {
    var Scenario = (function () {
        function Scenario() {
            this.subScenario = [];
            this.effectedCriteriaIds = [];
            this.effectedValueSourceIds = [];
            this.id = Helpers.Utils.createGuid();
        }
        Scenario.prototype.calculateWeights = function () {
        };
        return Scenario;
    })();
    Models.Scenario = Scenario;
})(Models || (Models = {}));
//# sourceMappingURL=Scenario.js.map
