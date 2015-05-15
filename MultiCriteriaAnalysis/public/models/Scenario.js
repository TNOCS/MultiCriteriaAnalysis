var Models;
(function (Models) {
    var Scenario = (function () {
        function Scenario(data) {
            var _this = this;
            this.userWeight = 1;
            this.subScenarios = [];
            this.score = 0;
            this.hasSubs = function () {
                return _this.subScenarios.length > 0;
            };
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }
        Scenario.prototype.fromJson = function (data) {
            var _this = this;
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.userWeight = data.userWeight;
            this.calculateWeights();
            data.subScenarios.forEach(function (d) {
                var scenario = new Scenario();
                scenario.fromJson(d);
                _this.subScenarios.push(scenario);
            });
        };
        Scenario.prototype.findParent = function (project) {
            var subs = project.scenarios;
            if (subs.length == 0)
                return null;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) {
                    var root = new Models.Scenario();
                    root.subScenarios = subs;
                    return root;
                }
                var parent = this.findParentRecursively(sub);
                if (parent != null)
                    return parent;
            }
            return null;
        };
        Scenario.prototype.findParentRecursively = function (parent) {
            var subs = parent.subScenarios;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this)
                    return parent;
                if (sub.subScenarios.length > 0) {
                    var parent2 = this.findParentRecursively(sub);
                    if (parent2 != null)
                        return parent2;
                }
            }
            return null;
        };
        Scenario.prototype.calculateWeights = function () {
            var totalWeight = 0;
            if (this.subScenarios.length === 0)
                return;
            this.subScenarios.forEach(function (scenario) {
                totalWeight += scenario.userWeight;
            });
            if (totalWeight === 0)
                return;
            this.subScenarios.forEach(function (scenario) {
                scenario.weight = scenario.userWeight / totalWeight;
                if (scenario.subScenarios.length > 0)
                    scenario.calculateWeights();
            });
        };
        return Scenario;
    })();
    Models.Scenario = Scenario;
})(Models || (Models = {}));
