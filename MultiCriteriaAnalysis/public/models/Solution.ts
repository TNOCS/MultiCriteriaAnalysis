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
        public id: string;
        public title: string;
        public scores: {
            [criteriaId: string]:
                {
                    criteriaOptionId: string;
                    value: number;
                }
        } = {};
        //public scores    : Score[] = [];
        public totalValue: number;

        constructor() {
            this.id = Helpers.Utils.createGuid();
        }

        public calculateScore(): number {
            var totalScore = 0;
            for (var k in this.scores) {
                var score = this.scores[k];
                totalScore += score.value;
            }
            return totalScore;
        }
    }

}