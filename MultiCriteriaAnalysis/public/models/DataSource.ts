module Models {
    /** Can either be a person or a model */
    export class DataSource {
        id   : string;
        title: string;

        constructor(title?: string, id?: string) {
            if (!id) this.id = Helpers.Utils.createGuid();
            if (title) this.title = title;
        }

        /** Deserialize the object */
        public fromJson(data: DataSource) {
            this.id                  = data.id;
            this.title               = data.title;
        }
    }

    export class DataSourceViewModel extends Models.DataSource {
        constructor(public title: string, public id: string, public group: string, public filter: Function) {
            super(title, id);
        }
    }
}