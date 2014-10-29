module Models {

    export class Score {
        public scenarioId       : string;
        public criteriaId       : string;
        public criteriaOptionId : string;
        public value            : number;
    }

    /**
     * MCA solution alternative
     */
    export class Solution {
        public id        : string;
        public title     : string;
        public scores    : Score[] = [];
        public totalValue: number;

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

        public calculateScore() : number {
            return 0;
        }
    }

}