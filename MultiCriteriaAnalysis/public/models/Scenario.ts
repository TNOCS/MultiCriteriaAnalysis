module Models {
    export class Scenario {
        public id                 : string;
        public title              : string;
        public description        : string;
        public userWeight         : number = 1;
        /** Effective weight, sums up to 1 */
        public weight             : number;
        public subScenarios       : Scenario[] = [];
        //public effectedCriteriaIds: string[] = []

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
            //this.effectedCriteriaIds = data.effectedCriteriaIds;
            this.calculateWeights();

            data.subScenarios.forEach((d) => {
                var scenario = new Scenario();
                scenario.fromJson(d);
                this.subScenarios.push(scenario);
            });
        }

        public hasSubs = () => {
            return this.subScenarios.length > 0;
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
                if (sub.subScenarios.length > 0) return this.findParentRecursively(sub);
            }
            return null;
        }

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

        public calculateWeights() {
            var totalWeight = 0;
            if (this.subScenarios.length === 0) return;
            this.subScenarios.forEach((c) => {
                totalWeight += c.userWeight;
            });
            if (totalWeight == 0) return;
            this.subScenarios.forEach((c) => {
                c.weight = c.userWeight / totalWeight;
            });
        }

    }
}