var Models;
(function (Models) {
    var Solution = (function () {
        function Solution(data) {
            this.scores = {};
            this.moduleScores = {};
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
        Solution.prototype.computeModuleScores = function (criterion, proj) {
            var _this = this;
            if (!proj.components || proj.components.length === 0 || !criterion.hasSubcriteria())
                return;
            var components = proj.components[0].components;
            if (components.length === 0)
                return;
            var moduleCriterias = this.getModuleDependentCriteria(criterion.subCriterias, components.length, proj);
            components.forEach(function (comp) { _this.moduleScores[comp.id] = 0; });
            moduleCriterias.forEach(function (mc) {
                mc.subCriterias.forEach(function (subc) {
                    _this.moduleScores[subc.componentId] += _this.computeScore(subc);
                });
            });
        };
        Solution.prototype.getModuleDependentCriteria = function (criterias, nrComponents, proj, runningResult) {
            var _this = this;
            if (runningResult === void 0) { runningResult = []; }
            var result = runningResult;
            if (criterias.length === nrComponents && criterias.every(function (subcr) { return (typeof subcr.componentId !== 'undefined'); })) {
                if (criterias.every(function (cr) { return _this.scores.hasOwnProperty(cr.id); })) {
                    result.push(criterias[0].findParent(proj));
                }
            }
            else {
                for (var c = 0; c < criterias.length; c++) {
                    var cr = criterias[c];
                    if (cr.hasSubcriteria() && cr.subCriterias.length === nrComponents && cr.subCriterias.every(function (subcr) { return (typeof subcr.componentId !== 'undefined'); })) {
                        if (cr.subCriterias.every(function (subcr) { return _this.scores.hasOwnProperty(subcr.id); })) {
                            result.push(cr);
                        }
                        else {
                            continue;
                        }
                    }
                    else {
                        result = this.getModuleDependentCriteria(cr.subCriterias, nrComponents, proj, result);
                    }
                }
            }
            return result;
        };
        return Solution;
    }());
    Models.Solution = Solution;
})(Models || (Models = {}));
