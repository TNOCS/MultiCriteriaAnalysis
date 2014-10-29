module Models {

    export class CriteriaOption {
        public id         : string;
        public title      : string;
        public value      : number
        public description: string;

        constructor() {
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
        public subCriterias : Criteria[] = [];
        public options      : CriteriaOption[] = []

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

        public addOption(title: string, value: number) : CriteriaOption {
            var option = new CriteriaOption();
            option.title = title;
            option.value = value;
            this.options.push(option);
            return option;
        }

        public addSubCriteria(subCriteria: Criteria) {
            this.subCriterias.push(subCriteria);
        }

        public calculateWeights() { }
    }
}