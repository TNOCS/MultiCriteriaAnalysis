var Models;
(function (Models) {
    var Scenario = (function () {
        //public effectedCriteriaIds: string[] = []
        function Scenario(data) {
            var _this = this;
            this.userWeight = 1;
            this.subScenarios = [];
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
            //this.effectedCriteriaIds = data.effectedCriteriaIds;
            this.calculateWeights();
            data.subScenarios.forEach(function (d) {
                var scenario = new Scenario();
                scenario.fromJson(d);
                _this.subScenarios.push(scenario);
            });
        };
        /**
         * Find the parent of the element. Returns null when there is no parent.
         */
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
        /**
         * Find the parent of the element. Returns null when no parent has been found.
         */
        Scenario.prototype.findParentRecursively = function (parent) {
            var subs = parent.subScenarios;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this)
                    return parent;
                if (sub.subScenarios.length > 0)
                    return this.findParentRecursively(sub);
            }
            return null;
        };
        ///**
        // * The last parent has no children, or if they have children, those children don't have their own children.
        // */
        //isLastParent(project: McaProject): boolean {
        //    if (this.subScenarios.length === 0) return true;
        //    var parent = this.findParent(project);
        //    return false;
        //}
        ///** 
        //* Returns true if this criteria id effects this scenario. 
        //*/
        //public isSelectedCriteria(id: string) {
        //    return this.effectedCriteriaIds.indexOf(id) >= 0;
        //}
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
//# sourceMappingURL=Scenario.js.map