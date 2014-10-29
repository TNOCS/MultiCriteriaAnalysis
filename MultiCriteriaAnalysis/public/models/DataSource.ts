module Models {
    /** Can either be a person or a model */
    export class DataSource {
        public id   : string;
        public title: string;

        constructor(title?: string) {
            if (title) this.title = title;
            this.id = Helpers.Utils.createGuid();
        }
    }

}