module Models {
    export interface IUserPreferences {
        id: string,
        userWeight: number
    }

    export class User {
        private id: string;
        name: string;
        description: string;
        criteriaPreferences: IUserPreferences[] = [];
        scenarioPreferences: IUserPreferences[] = [];

        constructor(name: string) {
            this.id = Helpers.Utils.createGuid();
            this.name = name;
            this.description = '...';
        }
    }
}
