module Models {

    export class CriteriaOption {
        public id         : string;
        public title      : string;
        public value      : number
        public description: string;

        constructor(title?: string, value?: number, description?: string, id?: string) {
            this.title = title;
            this.value = value;
            this.description = description;
            this.id = id || Helpers.Utils.createGuid();
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
        id           : string;
        title        : string;
        description  : string;
        userWeight   : number = 1;
        /** Depth of the criteria: 0 is root, 1 is main, 2 is sub etc. */
        level        : number;
        weight       : number;
        score        : number;
        subCriterias : Criteria[] = [];
        options      : CriteriaOption[] = []
        dataSourceId : string;
        /** When the criteria is a component of the system, this contains its id*/
        componentId  : string;
        /** The id of the input model (decision tree) for the criteria */
        decisionTreeId: string;
        /** When true, the criteria's value does not depend on the specific scenario. */
        isScenarioDependent = false;
        isEnabled = true;

        constructor(level: number, data?: Criteria) {
            this.level = level;
            if (data) {
                this.fromJson(data);
            } else {
                this.id = Helpers.Utils.createGuid();
            }
        }

        /** Deserialize the object */
        public fromJson(data: Criteria) {
            this.id           = data.id;
            this.title        = data.title;
            this.description  = data.description;
            this.userWeight   = data.userWeight;
            this.dataSourceId = data.dataSourceId;
            this.componentId  = data.componentId;
            this.decisionTreeId      = data.decisionTreeId;
            this.isScenarioDependent = data.isScenarioDependent;
            if (typeof data.isEnabled === 'undefined' || data.isEnabled == null) {
                this.isEnabled = true;
            } else {
                this.isEnabled = data.isEnabled;
            }
            // if (this.userWeight === 0) {
            //     this.isEnabled = false;
            // }
            this.calculateWeights();

            data.subCriterias.forEach((d) => {
                var criteria = new Criteria(this.level + 1);
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
            return this.isEnabled && this.subCriterias.length === 0;
        }

        public canHaveSubs = () => {
            return this.isEnabled && this.options.length === 0;
        }

        public hasOptions(): boolean {
             return this.options.length > 0;
        }

        public hasSubcriteria(): boolean {
             return this.subCriterias.length > 0;
        }

        public getOptionValueById(id: string) : number {
            var option = this.getOptionById(id);
            return option === null ? 0 : option.value;
        }

        public getOptionById(id: string): CriteriaOption {
            for (var k in this.options) {
                if (!this.options.hasOwnProperty(k)) continue;
                var option = this.options[k];
                if (option.id === id) return option;
            }
            return null;
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
            option.description = 'Description';
            this.options.push(option);
            return option;
        }

        public addSubCriteria(subCriteria: Criteria) {
            this.subCriterias.push(subCriteria);
        }

        /**
         * Update the weights recursively.
         */
        public calculateWeights() {
            var totalWeight = 0;
            if (this.userWeight === 0) { this.isEnabled = false; }
            if (this.subCriterias.length === 0 || !this.isEnabled) return;
            this.subCriterias.forEach((c) => {
                if (c.userWeight === 0) { c.isEnabled = false; }
                if (c.isEnabled) totalWeight += c.userWeight;
            });
            if (totalWeight == 0) return;
            this.subCriterias.forEach((c) => {
                if (c.isEnabled) c.weight = c.userWeight / totalWeight;
                if (c.subCriterias.length > 0) c.calculateWeights();
            });
        }

        /**
         * Find the parent of the element. Returns null when there is no parent.
         */
        public findParent(project: McaProject): Criteria {
            var subs = project.criterias;
            if (subs.length === 0) return null;
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub === this) {
                    var root = new Models.Criteria(0);
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
                if (sub.subCriterias.length > 0) { 
                   var par = this.findParentRecursively(sub);
                   if (par !== null) {
                       return par;
                   }
                }
            }
            return null;
        }
        
        findOptionByTitle(optionTitle: string): CriteriaOption {
            if (!this.options || this.options.length === 0) return;
            return (this.options.filter((o) => { return o.title === optionTitle }).pop());
        }
    }

    export class SelectableCriterion extends Models.Criteria {
        constructor(public criterion: Models.Criteria, public selectedId: string, parentWeight: number) {
            super(-1);
            this.id = criterion.id;
            this.title = criterion.title;
            this.description = criterion.description;
            this.userWeight = criterion.userWeight;
            this.componentId = criterion.componentId;
            this.decisionTreeId = criterion.decisionTreeId;
            this.weight = criterion.weight * parentWeight;
            this.options = criterion.options;
        }
    }


}
