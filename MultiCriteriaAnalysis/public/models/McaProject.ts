module Models {
    export class McaProject {
        public title: string;

        public criterias    : Criteria[]    = [];
        public scenarios    : Scenario[]    = [];
        public solutions    : Solution[]    = [];
        public valueSources : ValueSource[] = [];

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
            var project = new McaProject();

            var criteria = new Criteria();
            criteria.title = 'Resilience';
            criteria.userWeight = 2;

            var subCriteria = new Criteria();
            subCriteria.title = 'Repair time';
            subCriteria.description = 'Repair time is dependent to the type of damage';
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



            criteria.calculateWeights();
            project.criterias.push(criteria);
        }

    }

}