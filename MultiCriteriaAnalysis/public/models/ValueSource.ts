module Models {
    export class ValueSource {
        public id   : string;
        public title: string;

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }
    }

}