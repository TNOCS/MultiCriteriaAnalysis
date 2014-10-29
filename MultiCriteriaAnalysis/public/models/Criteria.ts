module Models {

    export interface ICriteriaOption {
        id   : string;
        title: string;
        value: number;
    }

    export class CriteriaOption implements ICriteriaOption {
        public id   : string;

        constructor(public title: string, public value: number) {
            //this.id = Helpers.Utils.createGuid();
        }
    }

    export interface ICriteria {
        id     : number;
        title  : string;
        weight : number;
        options: Array<ICriteriaOption>;
    }

    export class Criteria implements ICriteria {
        public id     : number;
        public title  : string;
        public weight : number;
        public options: Array<ICriteriaOption> = []

        public addOption(title: string, value: number) {
            this.options.push(new CriteriaOption(title, value));
        }
    }
}