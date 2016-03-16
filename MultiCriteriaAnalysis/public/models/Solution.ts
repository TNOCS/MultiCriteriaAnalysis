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
            [criteriaId: string]: {
                [scenarioId: string]: {
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
        
        /** Clone the object */
        public cloneSolution(data: Solution) {
            this.id          = Helpers.Utils.createGuid();
            this.title       = data.title;
            this.description = data.description;
            this.scores      = JSON.parse(JSON.stringify(data.scores)); //Clone data instead of making a reference
        }

        /**
         * Compute the score for a criterion.
         */
        public computeScore(criterion: Models.Criteria): number {
            var totalScore = 0;
            if (!criterion.hasSubcriteria()) {
                // Leaf node
                if (criterion.id in this.scores) {
                    var score = this.scores[criterion.id];
                    for (var key in score) {
                        if (!score.hasOwnProperty(key)) continue;
                        var activeScore = score[key];
                        totalScore += activeScore.weight * activeScore.value;
                    }
                }
            } else {
                var totalWeight = 0;
                criterion.subCriterias.forEach(c => {
                    totalWeight += c.userWeight;
                });
                criterion.subCriterias.forEach(c => {
                    c.weight = c.userWeight / totalWeight;
                    if (c.weight)
                        totalScore += c.weight * this.computeScore(c);
                });
            }
            criterion.score = totalScore;
            return totalScore;
        }
    }

}
