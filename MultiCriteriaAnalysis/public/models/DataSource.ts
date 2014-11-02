module Models {
    /** Can either be a person or a model */
    export class DataSource {
        public id   : string;
        public title: string;

        constructor(title?: string) {
            this.id = Helpers.Utils.createGuid();
            if (title) this.title = title;
        }

        /** Deserialize the object */
        public fromJson(data: DataSource) {
            this.id                  = data.id;
            this.title               = data.title;
        }
    }
}