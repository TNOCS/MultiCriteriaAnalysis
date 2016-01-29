var Models;
(function (Models) {
    var Component = (function () {
        function Component(comp) {
            var _this = this;
            if (comp === void 0) { comp = {}; }
            this.components = [];
            this.title = comp.title || 'new component';
            this.id = comp.id || Helpers.Utils.createGuid();
            this.level = comp.level || 1;
            if (!comp.components)
                return;
            comp.components.forEach(function (c) { return _this.components.push(new Component(c)); });
        }
        return Component;
    })();
    Models.Component = Component;
    var McaProject = (function () {
        function McaProject(projectData) {
            this.components = [];
            this.criterias = [];
            this.scenarios = [];
            this.solutions = [];
            this.dataSources = [];
            this.criteriaCache = {};
            if (projectData)
                this.fromJson(projectData);
            if (!this.id)
                this.id = Helpers.Utils.createGuid();
        }
        McaProject.prototype.updateCriteriaAndScenarios = function () {
            this.updateCriteriaWeights();
            this.updateScenarioWeights();
            this.updateScores();
        };
        McaProject.prototype.updateCriteriaWeights = function () {
            this.rootCriterion.calculateWeights();
        };
        McaProject.prototype.updateScenarioWeights = function () {
            this.rootScenario.calculateWeights();
        };
        McaProject.prototype.updateScores = function () {
            this.updateCriteriaWeights();
            this.updateScenarioWeights();
            var criteriaIds = {};
            var optionIds = {};
            this.getOptionIds(optionIds, criteriaIds);
            var scenarioIds = {};
            this.getScenarioIds(scenarioIds);
            this.solutions.forEach(function (s) {
                for (var critKey in s.scores) {
                    if (!s.scores.hasOwnProperty(critKey))
                        continue;
                    if (!criteriaIds.hasOwnProperty(critKey)) {
                        delete s.scores[critKey];
                        continue;
                    }
                    var criteria = s.scores[critKey];
                    for (var scenKey in criteria) {
                        if (!criteria.hasOwnProperty(scenKey))
                            continue;
                        if (scenKey !== "0" && !scenarioIds.hasOwnProperty(scenKey)) {
                            delete s.scores[critKey][scenKey];
                            continue;
                        }
                        var selectedOptionId = criteria[scenKey].criteriaOptionId;
                        if (optionIds.hasOwnProperty(selectedOptionId)) {
                            if (!optionIds.hasOwnProperty(selectedOptionId)) {
                                delete s.scores[critKey][scenKey];
                            }
                            var c = criteriaIds[critKey];
                            var selectedOption = s.scores[critKey][scenKey];
                            selectedOption.value = optionIds[selectedOptionId].value;
                            if (c.isScenarioDependent) {
                                var scen = scenarioIds[scenKey];
                                selectedOption.weight = scen.weight;
                            }
                            else {
                                selectedOption.weight = 1;
                            }
                        }
                    }
                }
            });
        };
        McaProject.prototype.getOptionIds = function (optionIds, criteriaIds, criterion) {
            var _this = this;
            if (criterion === void 0) { criterion = this.rootCriterion; }
            criterion.subCriterias.forEach(function (c) {
                criteriaIds[c.id] = c;
                c.options.forEach(function (o) {
                    optionIds[o.id] = o;
                });
                if (c.subCriterias.length > 0)
                    _this.getOptionIds(optionIds, criteriaIds, c);
            });
        };
        McaProject.prototype.getScenarioIds = function (scenarioIds, scenario) {
            var _this = this;
            if (scenario === void 0) { scenario = this.rootScenario; }
            scenario.subScenarios.forEach(function (s) {
                scenarioIds[s.id] = s;
                if (s.subScenarios.length > 0)
                    _this.getScenarioIds(scenarioIds, s);
            });
        };
        McaProject.prototype.fromJson = function (projectData) {
            var _this = this;
            if (!projectData.title)
                return null;
            this.id = projectData.id;
            this.title = projectData.title;
            this.description = projectData.description;
            this.url = projectData.url;
            if (projectData.components)
                projectData.components.forEach(function (comp) { return _this.components.push(new Models.Component(comp)); });
            if (projectData.criterias)
                projectData.criterias.forEach(function (data) { return _this.criterias.push(new Models.Criteria(1, data)); });
            if (projectData.scenarios)
                projectData.scenarios.forEach(function (data) { return _this.scenarios.push(new Models.Scenario(data)); });
            if (projectData.dataSources)
                projectData.dataSources.forEach(function (data) {
                    var dataSource = new Models.DataSource();
                    dataSource.fromJson(data);
                    _this.dataSources.push(dataSource);
                });
            if (projectData.solutions)
                projectData.solutions.forEach(function (data) { return _this.solutions.push(new Models.Solution(data)); });
        };
        Object.defineProperty(McaProject.prototype, "rootCriterion", {
            get: function () {
                var criterion = new Models.Criteria(0);
                criterion.title = 'TOP';
                criterion.weight = 1;
                criterion.subCriterias = this.criterias;
                return criterion;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(McaProject.prototype, "rootScenario", {
            get: function () {
                var scenario = new Models.Scenario();
                scenario.id = '';
                scenario.title = 'TOP';
                scenario.subScenarios = this.scenarios;
                return scenario;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(McaProject.prototype, "rootAndIndependentScenario", {
            get: function () {
                var scenario = this.rootScenario;
                scenario.subScenarios = [];
                var independentScenario = new Models.Scenario();
                independentScenario.id = "0";
                independentScenario.title = 'Independent of scenario';
                scenario.subScenarios.push(independentScenario);
                this.scenarios.forEach(function (s) { scenario.subScenarios.push(s); });
                return scenario;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(McaProject.prototype, "enabledCriterias", {
            get: function () {
                return this.criterias.filter(function (item) { return item.isEnabled; });
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
        McaProject.createExampleProject = function () {
            var project = new McaProject();
            project.title = 'MCA EXAMPLE PROJECT';
            project.description = 'This is an example project.';
            project.dataSources.push(new Models.DataSource('Explosion model'));
            project.dataSources.push(new Models.DataSource('Flooding model'));
            project.dataSources.push(new Models.DataSource('Evacuation model'));
            project.dataSources.push(new Models.DataSource('FEM model'));
            project.dataSources.push(new Models.DataSource('Architect'));
            var criteria = new Models.Criteria(1);
            criteria.title = 'Resilience';
            criteria.userWeight = 2;
            var subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Repair time';
            subCriteria.dataSourceId = project.findDataSourceByTitle('Explosion model').id;
            subCriteria.description = 'Repair time is dependent on the type of damage';
            subCriteria.userWeight = 3;
            subCriteria.isScenarioDependent = true;
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
            subCriteria = new Models.Criteria(2);
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
            subCriteria = new Models.Criteria(2);
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
            criteria = new Models.Criteria(1);
            criteria.title = 'Safety';
            criteria.userWeight = 3;
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Victims';
            subCriteria.isScenarioDependent = true;
            subCriteria.userWeight = 1;
            subCriteria.addOption('no victims', 1);
            subCriteria.addOption('only light injuries', .7);
            subCriteria.addOption('heavy injuries up to 10 people including possible lethality', .4);
            subCriteria.addOption('heavy injuries up to 50 people including possible lethality', .2);
            subCriteria.addOption('heavy injuries more than 50 people including possible lethality', 0);
            criteria.addSubCriteria(subCriteria);
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Evacuation time';
            subCriteria.isScenarioDependent = true;
            subCriteria.userWeight = 1;
            subCriteria.addOption('up to 5 minutes', 1);
            subCriteria.addOption('up to 10 minutes', .6);
            subCriteria.addOption('more than 10 minutes', .2);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            criteria = new Models.Criteria(1);
            criteria.title = 'Security';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Accessibility';
            subCriteria.userWeight = 1;
            subCriteria.isScenarioDependent = true;
            subCriteria.addOption('all access', .2);
            subCriteria.addOption('partial access', .6);
            subCriteria.addOption('all private access', 1);
            criteria.addSubCriteria(subCriteria);
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Surveilance';
            subCriteria.isScenarioDependent = true;
            subCriteria.userWeight = 1;
            subCriteria.addOption('no monitoring', 0);
            subCriteria.addOption('monitoring access', .4);
            subCriteria.addOption('video monitoring', .7);
            subCriteria.addOption('security check', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            criteria = new Models.Criteria(1);
            criteria.title = 'Iconic';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Impact';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            criteria = new Models.Criteria(1);
            criteria.title = 'Functionality';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Functionality';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
            criteria = new Models.Criteria(1);
            criteria.title = 'Energy-efficiency';
            criteria.userWeight = 1;
            subCriteria = new Models.Criteria(2);
            subCriteria.title = 'Energy-efficiency';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);
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
                solution.scores[0] = {};
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
                    scores[criteria.isScenarioDependent ? scenarioId : 0][criteria.id] = {
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
