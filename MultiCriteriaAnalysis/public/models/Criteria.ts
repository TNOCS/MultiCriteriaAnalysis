﻿module Models {

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
        public canHaveOptions = () => {
            return this.subCriterias.length == 0;
        }
        public canHaveSubs = () => {
            return this.options.length == 0;
        }
        public dataSourceId : string;

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

        public calculateWeights() {
            var totalWeight = 0;
            if (this.subCriterias.length === 0) return;
            this.subCriterias.forEach((c) => {
                totalWeight += c.userWeight;
            });
            if (totalWeight == 0) return;
            this.subCriterias.forEach((c) => {
                c.weight = c.userWeight / totalWeight;
            });
        }
    }
}