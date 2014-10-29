module Models {
    export class McaProject {
        public title: string;

        public criterias    : Criteria[]    = [];
        public scenarios    : Scenario[]    = [];
        public solutions    : Solution[]    = [];
        public valueSources : ValueSource[] = [];

        constructor() {
            this.createDummy();
        }

        public saveToJson(): boolean {
            return false;
        }

        public loadFromJson(): boolean {
            return false;
        }

        public toJson(): string {
            return '';
        }

        public fromJson(json: string): boolean {
            return false;
        }

        public createDummy() {
            this.title = 'MCA DUMMY PROJECT';

            var criteria = new Criteria();
            criteria.title = 'Resilience';
            criteria.userWeight = 2;

            var subCriteria = new Criteria();
            subCriteria.title = 'Repair time';
            subCriteria.description = 'Repair time is dependent on the type of damage';
            subCriteria.userWeight = 3;
            subCriteria.addOption('no repair time needed', 1);
            var option = subCriteria.addOption('up to 1 week', .8);
            option.description = 'No structural and less than up to 100m2 façade/floor damages etc.';
            option = subCriteria.addOption('up to 1 month', .5);
            option.description = 'Very light structural damage up to 1000m2 façade/floor damages etc.';
            option = subCriteria.addOption('up to 1 year', .2);
            option.description = 'Significant structural damage more than 1000m2 damage.';
            option = subCriteria.addOption('unrepairable', 0);
            option.description = 'Column failures or collapse ';
            criteria.addSubCriteria(subCriteria);

            subCriteria = new Criteria();
            subCriteria.title = 'Physical Usability';
            subCriteria.description = 'Type of damage and location of damage';
            subCriteria.userWeight = 4;
            option = subCriteria.addOption('no reduction in usability', 1);
            option.description = 'no damage';
            option = subCriteria.addOption('up to 100m2 cannot be used', .8);
            option.description = 'up to 100m2 not safely accessible/functional.';
            option = subCriteria.addOption('between 101 and 500 m2 cannot be used', .5);
            option.description = 'up to 500m2 not safely accessible/functional.';
            option = subCriteria.addOption('more than 500m2 cannot be used', .2);
            option.description = 'more than 500m2 not safely accessible/functional';
            criteria.addSubCriteria(subCriteria);

            subCriteria = new Criteria();
            subCriteria.title = 'Operational Usability';
            subCriteria.description = 'type of damage to services and location of damage';
            subCriteria.userWeight = 1;
            subCriteria.addOption('all services available', 1);
            subCriteria.addOption('some services available, work around possible', .5);
            subCriteria.addOption('limited services available, but livable ', .2);
            subCriteria.addOption('too much services out of order or critical service(s) out of order', 0);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();

            this.criterias.push(criteria);
        }

    }

}