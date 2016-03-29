module Models {

    //export class Score {
    //    public scenarioId: string;
    //    public criteriaId: string;
    //    public criteriaOptionId: string;
    //    public value: number;
    //}

    export interface IModuleScores {
        [componentId: string]: number;
    }

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
        public moduleScores: IModuleScores = {};
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
        
        /**
         * Compute the score for the modules.
         */
        public computeModuleScores(criterion: Models.Criteria, proj: Models.McaProject) {
            if (!proj.components || proj.components.length === 0 || !criterion.hasSubcriteria()) return;
            var components = proj.components[0].components;
            if (components.length === 0) return;
            //Find all criteria that are module-dependent
            var moduleCriterias = this.getModuleDependentCriteria(criterion.subCriterias, components.length, proj);
            components.forEach((comp: Models.Component) => { this.moduleScores[comp.id] = 0 });
            moduleCriterias.forEach((mc: Models.Criteria) => {
                mc.subCriterias.forEach((subc) => {
                    this.moduleScores[subc.componentId] += this.computeScore(subc);
                });
            });
        }

        /**
         * Find all criteria which are module-dependent and have a score filled in for all modules
         */
        public getModuleDependentCriteria(criterias: Models.Criteria[], nrComponents: number, proj: Models.McaProject, runningResult: Models.Criteria[] = []): Models.Criteria[] {
            var result = runningResult;
            if (criterias.length === nrComponents && criterias.every((subcr) => { return (typeof subcr.componentId !== 'undefined') })) {
                if (criterias.every((cr) => { return this.scores.hasOwnProperty(cr.id) })) {
                    result.push(criterias[0].findParent(proj));
                }
            } else {
                for (let c = 0; c < criterias.length; c++) {
                    let cr = criterias[c];
                    if (cr.hasSubcriteria() && cr.subCriterias.length === nrComponents && cr.subCriterias.every((subcr) => { return (typeof subcr.componentId !== 'undefined') })) {
                        if (cr.subCriterias.every((subcr) => { return this.scores.hasOwnProperty(subcr.id) })) {
                            result.push(cr);
                        } else {
                            continue;
                        }
                    } else {
                        result = this.getModuleDependentCriteria(cr.subCriterias, nrComponents, proj, result);
                    }
                }
            }
            return result;
        }
    }
}
