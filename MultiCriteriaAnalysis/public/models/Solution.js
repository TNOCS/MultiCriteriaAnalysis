var Models;
(function (Models) {
    //export class Score {
    //    public scenarioId: string;
    //    public criteriaId: string;
    //    public criteriaOptionId: string;
    //    public value: number;
    //}
    /**
     * MCA solution alternative
     */
    var Solution = (function () {
        function Solution(data) {
            this.scores = {};
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }
        /** Deserialize the object */
        Solution.prototype.fromJson = function (data) {
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.scores = data.scores;
        };
        /**
         * Compute the score for a scenario.
         */
        Solution.prototype.computeScore = function (scenario) {
            var _this = this;
            var totalScore = 0;
            if (!scenario.hasSubs()) {
                // Leaf node
                if (scenario.id in this.scores) {
                    var score = this.scores[scenario.id];
                    for (var criterionId in score) {
                        if (!score.hasOwnProperty(criterionId))
                            continue;
                        var criteriaScore = score[criterionId];
                        totalScore += criteriaScore.weight * criteriaScore.value;
                    }
                }
            }
            else {
                scenario.subScenarios.forEach(function (s) {
                    s.calculateWeights();
                    if (s.weight)
                        totalScore += s.weight * _this.computeScore(s);
                });
            }
            scenario.score = totalScore;
            return totalScore;
        };
        return Solution;
    })();
    Models.Solution = Solution;
})(Models || (Models = {}));
//# sourceMappingURL=Solution.js.map