var Models;
(function (Models) {
    var Score = (function () {
        function Score() {
        }
        return Score;
    })();
    Models.Score = Score;

    /**
    * MCA solution alternative
    */
    var Solution = (function () {
        function Solution() {
            this.scores = [];
            this.id = Helpers.Utils.createGuid();
        }
        Solution.prototype.calculateScore = function () {
            return 0;
        };
        return Solution;
    })();
    Models.Solution = Solution;
})(Models || (Models = {}));
//# sourceMappingURL=Solution.js.map
