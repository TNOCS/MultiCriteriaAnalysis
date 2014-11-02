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
