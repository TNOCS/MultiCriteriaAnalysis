﻿module Models {

    export class CriteriaOption {
        public id         : string;
        public title      : string;
        public value      : number
        public description: string;

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

        /** Deserialize the object */
        public fromJson(data: CriteriaOption) {
            this.id          = data.id;
            this.title       = data.title;
            this.description = data.description;
            this.value       = data.value;
        }

        get fullTitle() {
            return this.title + ' (' + this.value + ')'; 
        }
    }

    export class Criteria {
        public id           : string;
        public title        : string;
        public description  : string;
        public userWeight   : number = 1;
        /** Effective weight, sums up to 1 */
        public weight       : number;
        public subCriterias : Criteria[] = [];
        public options      : CriteriaOption[] = []
        public dataSourceId : string;

        constructor(data?: Criteria) {
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }

        /** Deserialize the object */
        public fromJson(data: Criteria) {
            this.id           = data.id;
            this.title        = data.title;
            this.description  = data.description;
            this.userWeight   = data.userWeight;
            this.dataSourceId = data.dataSourceId;
            this.calculateWeights();

            data.subCriterias.forEach((d) => {
                var criteria = new Criteria();
                criteria.fromJson(d);
                this.subCriterias.push(criteria);
            });
            data.options.forEach((d) => {
                var option = new CriteriaOption();
                option.fromJson(d);
                this.options.push(option);
            });
        }

        public canHaveOptions = () => {
            return this.subCriterias.length === 0;
        }

        public canHaveSubs = () => {
            return this.options.length === 0;
        }

        public hasOptions(): boolean {
             return this.options.length > 0;
        }

        public hasSubcriteria(): boolean {
             return this.subCriterias.length > 0;
        }

        public getOptionValueById(id: string) : number {
            for (var k in this.options) {
                var option = this.options[k];
                if (option.id == id) return option.value;
            }
            return 0;
        }

        sortOptions(sortAscending: boolean) {
            this.options = this.options.sort((o1, o2) => {
                return sortAscending 
                    ? o1.value - o2.value
                    : o2.value - o1.value;
            });
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

        /**
         * Find the parent of the element. Returns null when there is no parent.
         */
        findParent(project: McaProject): Criteria {
            var subs = project.criterias;
            if (subs.length == 0) return null;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) {
                    var root = new Models.Criteria();
                    root.subCriterias = subs;
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
        private findParentRecursively(parent: Criteria): Criteria {
            var subs = parent.subCriterias;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) return parent;
                if (sub.subCriterias.length > 0) return this.findParentRecursively(sub);
            }
            return null;
        }


    }
}