module Models {
    export interface IUser {
        name:         string,
        id?:          string,
        username?:    string,
        password?:    string,
        description?: string,
        preferences?: { [title: string] : number }
    }

    export class User implements IUser {
        id:          string;
        name:        string;
        description: string;
        username:    string;
        password:    string;

        /**
         * The preferences map between a scenario/criteria title and a user weight.
         * I use the title, as the same title (with different IDs) is used for modules etc.
         */
        preferences: { [title: string] : number };

        constructor(user: IUser) {
            this.id = user.id || Helpers.Utils.createGuid();
            this.name = user.name || '';
            this.description = user.description || '...';
            this.preferences = user.preferences ? user.preferences : {};
            this.username = user.username || '';
            this.password = user.password || '';
        }

        /** Get the user weight. In case the user has no preference set, add it (and set it to 0) */
        public getUserWeight(title: string) {
            if (!this.preferences.hasOwnProperty(title)) this.preferences[title] = 0;
            return this.preferences[title];
        }
    }
}
