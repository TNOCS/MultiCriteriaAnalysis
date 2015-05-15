module Models {
    export class Scenario {
        public id                 : string;
        public title              : string;
        public description        : string;
        public userWeight         : number = 1;
        /** Effective weight, sums up to 1 */
        public weight             : number;
        public subScenarios       : Scenario[] = [];
        public score = 0;

        constructor(data?: Scenario) {
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }

        /** Deserialize the object */
        public fromJson(data: Scenario) {
            this.id                  = data.id;
            this.title               = data.title;
            this.description         = data.description;
            this.userWeight          = data.userWeight;
            this.calculateWeights();

            data.subScenarios.forEach((d) => {
                var scenario = new Scenario();
                scenario.fromJson(d);
                this.subScenarios.push(scenario);
            });
        }

        public hasSubs = () => {
            return this.subScenarios !== null && this.subScenarios.length > 0;
        }

        /**
         * Find the parent of the element. Returns null when there is no parent.
         */
        findParent(project: McaProject): Scenario {
            var subs = project.scenarios;
            if (subs.length == 0) return null;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) {
                    var root = new Models.Scenario();
                    root.subScenarios = subs;
                    return root;
                }
                var parent = this.findParentRecursively(sub);
                if (parent != null) return parent;
            }
            return null;
        }

        /**
         * Find the parent of the element. Returns null when no parent has been found.
         */
        private findParentRecursively(parent: Scenario): Scenario {
            var subs = parent.subScenarios;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) return parent;
                if (sub.subScenarios.length > 0) {
                    var parent2 = this.findParentRecursively(sub);
                    if (parent2 != null) return parent2;
                }
            }
            return null;
        }

        /**
         * Update the weights recursively.
         */
        public calculateWeights() {
            var totalWeight = 0;
            if (this.subScenarios.length === 0) return;
            this.subScenarios.forEach((scenario) => {
                totalWeight += scenario.userWeight;
            });
            if (totalWeight === 0) return;
            this.subScenarios.forEach((scenario) => {
                scenario.weight = scenario.userWeight / totalWeight;
                if (scenario.subScenarios.length > 0) scenario.calculateWeights();
            });
        }

    }
}
