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
        public scores: {
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

        /**
         * Compute the score for a scenario.
         */
        public computeScore(scenario: Models.Scenario): number {
            var totalScore = 0;
            if (!scenario.hasSubs()) {
                // Leaf node
                if (scenario.id in this.scores) {
                    var score = this.scores[scenario.id];
                    for (var criterionId in score) {
                        if (!score.hasOwnProperty(criterionId)) continue;
                        var criteriaScore = score[criterionId];
                        totalScore += criteriaScore.weight * criteriaScore.value;
                    }
                }
            } else {
                scenario.subScenarios.forEach((s) => {
                    s.calculateWeights();
                    if (s.weight)
                        totalScore += s.weight * this.computeScore(s);
                });
            }
            scenario.score = totalScore;
            return totalScore;
        }
    }

}