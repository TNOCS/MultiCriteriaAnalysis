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
    }

}