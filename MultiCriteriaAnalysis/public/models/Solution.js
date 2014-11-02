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
        function Solution() {
            this.scores = {};
            this.id = Helpers.Utils.createGuid();
        }
        Solution.prototype.calculateScore = function () {
            var totalScore = 0;
            for (var k in this.scores) {
                var score = this.scores[k];
                totalScore += score.value;
            }
            return totalScore;
        };
        return Solution;
    })();
    Models.Solution = Solution;
})(Models || (Models = {}));
//# sourceMappingURL=Solution.js.map
