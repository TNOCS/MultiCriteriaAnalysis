module Models {

    //export class Score {
    //    public scenarioId: string;
    //    public criteriaId: string;
    //    public criteriaOptionId: string;
    //    public value: number;
    //}

    /**
     * MCA solution alternative
     */
    export class Solution {
        public id         : string;
        public title      : string;
        public description: string;
        public scores     : {
            [scenarioId: string]: {
                [criteriaId: string]: {
                    criteriaOptionId: string;
                    value           : number;
                    weight          : number;
                }
            }
        } = {};
        //public scores    : Score[] = [];
        public totalValue: number;

        constructor(data?: Solution) {
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }

        /** Deserialize the object */
        public fromJson(data: Solution) {
            this.id          = data.id;
            this.title       = data.title;
            this.description = data.description;
            this.scores      = data.scores;
        }

        //public calculateScore(): number {
        //    var totalScore = 0;
        //    for (var k in this.scores) {
        //        var score = this.scores[k];
        //        totalScore += score.value;
        //    }
        //    return totalScore;
        //}
    }

}