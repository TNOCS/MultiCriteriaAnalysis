module Models {

    export class CriteriaOption {
        public id: string;
        public description: string;

        constructor(public title: string, public value: number) {
            this.id = Helpers.Utils.createGuid();
        }
    }

    export class Criteria {
        public id           : string;
        public title        : string;
        public description  : string;
        public userWeight   : number;
        /** Effective weight, sums up to 1 */
        public weight       : number;
        public subCriteria  : Criteria[] = [];
        public options      : CriteriaOption[] = []

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

        public addOption(title: string, value: number) {
            this.options.push(new CriteriaOption(title, value));
        }

        public calculateWeights() { }
    }
}