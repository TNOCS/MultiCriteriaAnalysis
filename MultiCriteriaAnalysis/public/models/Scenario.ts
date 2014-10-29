module Models {
    export class Scenario {
        public id                     : string;
        public title                  : string;
        public description            : string;
        public userWeight             : number;
        /** Effective weight, sums up to 1 */
        public weight                 : number;
        public subScenario            : Scenario[] = [];
        public effectedCriteriaIds    : string[] = []
        public effectedValueSourceIds : string[] = []

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

        public calculateWeights() { }

    }
}