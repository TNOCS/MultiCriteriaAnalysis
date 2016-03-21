var Models;
(function (Models) {
    var Solution = (function () {
        function Solution(data) {
            this.scores = {};
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }
        Solution.prototype.fromJson = function (data) {
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.scores = data.scores;
        };
        Solution.prototype.cloneSolution = function (data) {
            this.id = Helpers.Utils.createGuid();
            this.title = data.title;
            this.description = data.description;
            this.scores = JSON.parse(JSON.stringify(data.scores));
        };
        Solution.prototype.computeScore = function (criterion) {
            var _this = this;
            var totalScore = 0;
            if (!criterion.hasSubcriteria()) {
                if (criterion.id in this.scores) {
                    var score = this.scores[criterion.id];
                    for (var key in score) {
                        if (!score.hasOwnProperty(key))
                            continue;
                        var activeScore = score[key];
                        totalScore += activeScore.weight * activeScore.value;
                    }
                }
            }
            else {
                var totalWeight = 0;
                criterion.subCriterias.forEach(function (c) {
                    totalWeight += c.userWeight;
                });
                criterion.subCriterias.forEach(function (c) {
                    c.weight = c.userWeight / totalWeight;
                    if (c.weight)
                        totalScore += c.weight * _this.computeScore(c);
                });
            }
            criterion.score = totalScore;
            return totalScore;
        };
        return Solution;
    }());
    Models.Solution = Solution;
})(Models || (Models = {}));
