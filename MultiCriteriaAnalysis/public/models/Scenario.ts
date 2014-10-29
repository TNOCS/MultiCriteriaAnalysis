module Models {
    export class Scenario {
        public id                     : string;
        public title                  : string;
        public description            : string;
        public userWeight             : number;
        /** Effective weight, sums up to 1 */
        public weight                 : number;
        public subScenarios           : Scenario[] = [];
        public effectedCriteriaIds    : string[] = []

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

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