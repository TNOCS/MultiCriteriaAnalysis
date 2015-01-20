var Models;
(function (Models) {
    var McaProject = (function () {
        function McaProject(projectData) {
            // TODO Add a saved date.
            this.criterias = [];
            this.scenarios = [];
            this.solutions = [];
            this.dataSources = [];
            this.criteriaCache = {};
            if (projectData)
                this.fromJson(projectData);
        }
        /**
         * Deserialize the object
         */
        McaProject.prototype.fromJson = function (projectData) {
            var _this = this;
            this.title = projectData.title;
            this.description = projectData.description;
            projectData.criterias.forEach(function (data) {
                _this.criterias.push(new Models.Criteria(data));
            });
            projectData.scenarios.forEach(function (data) {
                _this.scenarios.push(new Models.Scenario(data));
            });
            projectData.dataSources.forEach(function (data) {
                var dataSource = new Models.DataSource();
                dataSource.fromJson(data);
                _this.dataSources.push(dataSource);
            });
            projectData.solutions.forEach(function (data) {
                _this.solutions.push(new Models.Solution(data));
            });
        };
        Object.defineProperty(McaProject.prototype, "rootCriterion", {
            get: function () {
                var criterion = new Models.Criteria();
                criterion.subCriterias = this.criterias;
                return criterion;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(McaProject.prototype, "rootScenario", {
            get: function () {
                var scenario = new Models.Scenario();
                scenario.subScenarios = this.scenarios;
                return scenario;
            },
            enumerable: true,
            configurable: true
        });
        McaProject.prototype.saveToJson = function () {
            return false;
        };
        McaProject.prototype.loadFromJson = function () {
            return false;
        };
        McaProject.prototype.toJson = function () {
            return '';
        };
        McaProject.prototype.findDataSourceByTitle = function (title) {
            if (!title || this.dataSources.length === 0)
                return null;
            title = title.toLowerCase();
            for (var i in this.dataSources) {
                var ds = this.dataSources[i];
                if (ds.title.toLowerCase() === title)
                    return ds;
            }
            return null;
        };
        /**
         * Finds a criteria by its ID. Returns null when nothing has been found.
         */
        McaProject.prototype.findCriteriaById = function (id, criterias) {
            if (criterias === void 0) { criterias = this.criterias; }
            if (this.criteriaCache.hasOwnProperty(id))
                return this.criteriaCache[id];
            if (criterias.length === 0)
                return null;
            for (var i = 0; i < criterias.length; i++) {
                var criterion = criterias[i];
                if (criterion.id === id) {
                    this.criteriaCache[id] = criterion;
                    return criterion;
                }
                ;
                if (criterion.subCriterias.length > 0) {
                    var found = this.findCriteriaById(id, criterion.subCriterias);
                    if (found != null)
                        return found;
                }
            }
            return null;
        };
        //private findCriteriaByIdRecursively(crits: Criteria[], title: string): Models.Criteria {
        //    for (var i in crits) {
        //        var criteria = crits[i];
        //        if (criteria.title.toLowerCase() === title) return criteria;
        //        if (criteria.subCriterias.length > 0) {
        //            var crit = this.findCriteriaByIdRecursively(criteria.subCriterias, title);
        //            if (crit != null) return crit;
        //        }                
        //    }
        //    return null;
        //}
        McaProject.createExampleProject = function () {
            var project = new McaProject();
            project.title = 'MCA EXAMPLE PROJECT';
            // DataSources
            project.dataSources.push(new Models.DataSource('Explosion model'));
            project.dataSources.push(new Models.DataSource('Flooding model'));
            project.dataSources.push(new Models.DataSource('Evacuation model'));
            project.dataSources.push(new Models.DataSource('FEM model'));
            project.dataSources.push(new Models.DataSource('Architect'));
            // Criterias
            // Resilience
            var criteria = new Models.Criteria();
            criteria.title = 'Resilience';
            criteria.userWeight = 2;
            var subCriteria = new Models.Criteria();
            subCriteria.title = 'Repair time';
            subCriteria.dataSourceId = project.findDataSourceByTitle('Explosion model').id;
            subCriteria.description = 'Repair time is dependent on the type of damage';
            subCriteria.userWeight = 3;
            subCriteria.addOption('no repair time needed', 1);
            var option = subCriteria.addOption('up to 1 week', .8);
            option.description = 'No structural and less than up to 100m2 façade/floor damages etc.';
            option = subCriteria.addOption('up to 1 month', .5);
            option.description = 'Very light structural damage up to 1000m2 façade/floor damages etc.';
            option = subCriteria.addOption('up to 1 year', .2);
            option.description = 'Significant structural damage more than 1000m2 damage.';
            option = subCriteria.addOption('unrepairable', 0);
            option.description = 'Column failures or collapse ';
            criteria.addSubCriteria(subCriteria);
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Physical Usability';
            subCriteria.dataSourceId = project.findDataSourceByTitle('Explosion model').id;
            subCriteria.description = 'Type of damage and location of damage';
            subCriteria.userWeight = 4;
            option = subCriteria.addOption('no reduction in usability', 1);
            option.description = 'no damage';
            option = subCriteria.addOption('up to 100m2 cannot be used', .8);
            option.description = 'up to 100m2 not safely accessible/functional.';
            option = subCriteria.addOption('between 101 and 500 m2 cannot be used', .5);
            option.description = 'up to 500m2 not safely accessible/functional.';
            option = subCriteria.addOption('more than 500m2 cannot be used', .2);
            option.description = 'more than 500m2 not safely accessible/functional';
            criteria.addSubCriteria(subCriteria);
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Operational Usability';
            subCriteria.description = 'type of damage to services and location of damage';
            subCriteria.userWeight = 1;
            subCriteria.addOption('all services available', 1);
            subCriteria.addOption('some services available, work around possible', .5);
            subCriteria.addOption('limited services available, but livable ', .2);
            subCriteria.addOption('too much services out of order or critical service(s) out of order', 0);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            // Safety
            criteria = new Models.Criteria();
            criteria.title = 'Safety';
            criteria.userWeight = 3;
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Victims';
            subCriteria.userWeight = 1;
            subCriteria.addOption('no victims', 1);
            subCriteria.addOption('only light injuries', .7);
            subCriteria.addOption('heavy injuries up to 10 people including possible lethality', .4);
            subCriteria.addOption('heavy injuries up to 50 people including possible lethality', .2);
            subCriteria.addOption('heavy injuries more than 50 people including possible lethality', 0);
            criteria.addSubCriteria(subCriteria);
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Evacuation time';
            subCriteria.userWeight = 1;
            subCriteria.addOption('up to 5 minutes', 1);
            subCriteria.addOption('up to 10 minutes', .6);
            subCriteria.addOption('more than 10 minutes', .2);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            // Security
            criteria = new Models.Criteria();
            criteria.title = 'Security';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Accessibility';
            subCriteria.userWeight = 1;
            subCriteria.addOption('all access', .2);
            subCriteria.addOption('partial access', .6);
            subCriteria.addOption('all private access', 1);
            criteria.addSubCriteria(subCriteria);
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Surveilance';
            subCriteria.userWeight = 1;
            subCriteria.addOption('no monitoring', 0);
            subCriteria.addOption('monitoring access', .4);
            subCriteria.addOption('video monitoring', .7);
            subCriteria.addOption('security check', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            // Iconic
            criteria = new Models.Criteria();
            criteria.title = 'Iconic';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Impact';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            // Functionality
            criteria = new Models.Criteria();
            criteria.title = 'Functionality';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Functionality';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            // Energy-efficiency
            criteria = new Models.Criteria();
            criteria.title = 'Energy-efficiency';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria();
            subCriteria.title = 'Energy-efficiency';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            // Scenarios
            // Scenario: Natural events
            var scenario = new Models.Scenario();
            scenario.title = 'Natural events';
            scenario.userWeight = 1;
            var subScenario = new Models.Scenario();
            subScenario.title = 'Extreme wind load';
            subScenario.userWeight = 2;
            var subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Force 1';
            subSubScenario.description = 'Description';
            subSubScenario.userWeight = 5;
            //subSubScenario.effectedCriteriaIds.push(project.findCriteriaByTitle('Repair time').id);
            //subSubScenario.effectedCriteriaIds.push(project.findCriteriaByTitle('Physical Usability').id);
            //subSubScenario.effectedCriteriaIds.push(project.findCriteriaByTitle('Operational Usability').id);
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Force 2';
            subSubScenario.userWeight = 3;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Force 3';
            subSubScenario.userWeight = 1;
            subScenario.subScenarios.push(subSubScenario);
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Extreme temperature';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Flooding';
            subScenario.userWeight = 4;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Seismic';
            subScenario.userWeight = 0;
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Seismic 1';
            subSubScenario.userWeight = 5;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Seismic 2';
            subSubScenario.userWeight = 3;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Seismic 3';
            subSubScenario.userWeight = 1;
            subScenario.subScenarios.push(subSubScenario);
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Wind and Flood';
            subScenario.userWeight = 3;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Flood and contamination';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            scenario.calculateWeights();
            project.scenarios.push(scenario);
            // Intended incidents (terrorists)
            scenario = new Models.Scenario();
            scenario.title = 'Intended incidents (terrorists)';
            scenario.userWeight = 2;
            subScenario = new Models.Scenario();
            subScenario.title = 'Explosion';
            subScenario.userWeight = 4;
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Car bomb external';
            subSubScenario.userWeight = 2;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Car bomb in parking garage';
            subSubScenario.userWeight = 4;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario = new Models.Scenario();
            subSubScenario.title = 'Backpack external';
            subSubScenario.userWeight = 1;
            subScenario.subScenarios.push(subSubScenario);
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Impact';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Arson / Fire';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Impact followed by fire';
            subScenario.userWeight = 2;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Chemical / bio attack';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Dirty bomb';
            subScenario.userWeight = 3;
            scenario.subScenarios.push(subScenario);
            scenario.calculateWeights();
            project.scenarios.push(scenario);
            // Unintended incidents
            scenario = new Models.Scenario();
            scenario.title = 'Unintended incidents (accidents)';
            scenario.userWeight = 4;
            subScenario = new Models.Scenario();
            subScenario.title = 'Explosion';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Impact';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Fire';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Hazmat';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Windload';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            subScenario = new Models.Scenario();
            subScenario.title = 'Temperature';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            scenario.calculateWeights();
            project.scenarios.push(scenario);
            project.rootCriterion.calculateWeights();
            project.rootScenario.calculateWeights();
            for (var i = 0; i < 5; i++) {
                var solution = new Models.Solution();
                solution.title = 'Version ' + (i + 1);
                for (var k = 0; k < project.scenarios.length; k++) {
                    var scenario = project.scenarios[k];
                    McaProject.createSolutionForScenario(project, solution, scenario);
                }
                project.solutions.push(solution);
            }
            return project;
        };
        McaProject.createSolutionForScenario = function (project, solution, scenario) {
            if (scenario.subScenarios.length > 0) {
                for (var i = 0; i < scenario.subScenarios.length; i++) {
                    McaProject.createSolutionForScenario(project, solution, scenario.subScenarios[i]);
                }
            }
            else {
                scenario.calculateWeights();
                solution.scores[scenario.id] = {};
                McaProject.eachCriteria(project.criterias, scenario.id, solution);
            }
        };
        McaProject.eachCriteria = function (criterias, scenarioId, solution, parentWeight) {
            if (parentWeight === void 0) { parentWeight = 1; }
            var scores = solution.scores;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (!criteria.isEnabled)
                    continue;
                if (criteria.hasSubcriteria()) {
                    McaProject.eachCriteria(criteria.subCriterias, scenarioId, solution, parentWeight * criteria.weight);
                }
                else {
                    var random = Math.round(Math.random() * (criteria.options.length - 1));
                    var selectedId = criteria.options[random].id;
                    scores[scenarioId][criteria.id] = {
                        criteriaOptionId: selectedId,
                        value: criteria.getOptionValueById(selectedId),
                        weight: parentWeight * criteria.weight
                    };
                }
            }
        };
        return McaProject;
    })();
    Models.McaProject = McaProject;
})(Models || (Models = {}));
//# sourceMappingURL=McaProject.js.map