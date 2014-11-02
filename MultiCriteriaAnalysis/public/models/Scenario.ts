module Models {
    export class Scenario {
        public id                 : string;
        public title              : string;
        public description        : string;
        public userWeight         : number;
        /** Effective weight, sums up to 1 */
        public weight             : number;
        public subScenarios       : Scenario[] = [];
        public effectedCriteriaIds: string[] = []

        constructor(data?: Scenario) {
            if (data)
                this.fromJson(data);
            else
                this.id = Helpers.Utils.createGuid();
        }

        /** Deserialize the object */
        public fromJson(data: Scenario) {
            this.id                  = data.id;
            this.title               = data.title;
            this.description         = data.description;
            this.userWeight          = data.userWeight;
            this.effectedCriteriaIds = data.effectedCriteriaIds;
            this.calculateWeights();

            data.subScenarios.forEach((d) => {
                var scenario = new Scenario();
                scenario.fromJson(d);
                this.subScenarios.push(scenario);
            });
        }

        public hasSubs = () => {
            return this.subScenarios.length > 0;
        }

        /** 
        * Returns true if this criteria id effects this scenario. 
        */
        public isSelectedCriteria(id: string) {
            return this.effectedCriteriaIds.indexOf(id) >= 0;
        }

        public calculateWeights() {
            var totalWeight = 0;
            if (this.subScenarios.length === 0) return;
            this.subScenarios.forEach((c) => {
                totalWeight += c.userWeight;
            });
            if (totalWeight == 0) return;
            this.subScenarios.forEach((c) => {
                c.weight = c.userWeight / totalWeight;
            });
        }

    }
}