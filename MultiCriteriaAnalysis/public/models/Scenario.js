var Models;
(function (Models) {
    var Scenario = (function () {
        function Scenario(data) {
            var _this = this;
            this.userWeight = 1;
            this.subScenarios = [];
            this.effectedCriteriaIds = [];
            this.hasSubs = function () {
                return _this.subScenarios.length > 0;
            };
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }
        /** Deserialize the object */
        Scenario.prototype.fromJson = function (data) {
            var _this = this;
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.userWeight = data.userWeight;
            this.effectedCriteriaIds = data.effectedCriteriaIds;
            this.calculateWeights();

            data.subScenarios.forEach(function (d) {
                var scenario = new Scenario();
                scenario.fromJson(d);
                _this.subScenarios.push(scenario);
            });
        };

        /**
        * Returns true if this criteria id effects this scenario.
        */
        Scenario.prototype.isSelectedCriteria = function (id) {
            return this.effectedCriteriaIds.indexOf(id) >= 0;
        };

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
