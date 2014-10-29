var Models;
(function (Models) {
    var Scenario = (function () {
        function Scenario() {
            this.subScenario = [];
            this.effectedCriteriaIds = [];
            this.effectedValueSourceIds = [];
        }
        Scenario.prototype.calculateWeights = function () {
        };
        return Scenario;
    })();
    Models.Scenario = Scenario;
})(Models || (Models = {}));
//# sourceMappingURL=Scenario.js.map
