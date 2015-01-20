module Models {
    export class McaProject {
        title      : string;
        description: string;

        // TODO Add a saved date.

        criterias   : Criteria[]   = [];
        scenarios   : Scenario[]   = [];
        solutions   : Solution[]   = [];
        dataSources : DataSource[] = [];

        constructor(projectData?: McaProject) {
            if (projectData) this.fromJson(projectData);
        }

        /** 
         * Deserialize the object 
         */
        fromJson(projectData: McaProject) {
            this.title       = projectData.title;
            this.description = projectData.description;

            projectData.criterias.forEach((data) => {
                this.criterias.push(new Models.Criteria(data));
            });
            projectData.scenarios.forEach((data) => {
                this.scenarios.push(new Models.Scenario(data));
            });
            projectData.dataSources.forEach((data) => {
                var dataSource = new Models.DataSource();
                dataSource.fromJson(data);
                this.dataSources.push(dataSource);
            });
            projectData.solutions.forEach((data) => {
                this.solutions.push(new Models.Solution(data));
            });
        }

        get rootCriterion() {
            var criterion = new Models.Criteria();
            criterion.subCriterias = this.criterias;
            return criterion;
        }

        get rootScenario() {
            var scenario = new Models.Scenario();
            scenario.subScenarios = this.scenarios;
            return scenario;
        }

        saveToJson(): boolean {
            return false;
        }

        loadFromJson(): boolean {
            return false;
        }

        toJson(): string {
            return '';
        }

        findDataSourceByTitle(title: string) : DataSource {
            if (!title || this.dataSources.length === 0) return null;
            title = title.toLowerCase();
            for (var i in this.dataSources) {
                var ds = this.dataSources[i];
                if (ds.title.toLowerCase() === title) return ds;
            }
            return null;
        }

        private criteriaCache: { [id: string]: Models.Criteria } = {};

        /**
         * Finds a criteria by its ID. Returns null when nothing has been found.
         */
        findCriteriaById(id: string, criterias = this.criterias): Criteria {
            if (this.criteriaCache.hasOwnProperty(id)) return this.criteriaCache[id];
            if (criterias.length === 0) return null;
            for (var i = 0; i < criterias.length; i++) {
                var criterion = criterias[i];
                if (criterion.id === id) {
                    this.criteriaCache[id] = criterion;
                    return criterion
                };
                if (criterion.subCriterias.length > 0) {
                    var found = this.findCriteriaById(id, criterion.subCriterias);
                    if (found != null) return found;
                }
            }
            return null;
        }
        
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

        static createExampleProject(): McaProject {
            var project   = new McaProject();
            project.title = 'MCA EXAMPLE PROJECT';

            // DataSources
            project.dataSources.push(new DataSource('Explosion model'));
            project.dataSources.push(new DataSource('Flooding model'));
            project.dataSources.push(new DataSource('Evacuation model'));
            project.dataSources.push(new DataSource('FEM model'));
            project.dataSources.push(new DataSource('Architect'));

            // Criterias
            // Resilience
            var criteria        = new Criteria();
            criteria.title      = 'Resilience';
            criteria.userWeight = 2;

            var subCriteria          = new Criteria();
            subCriteria.title        = 'Repair time';
            subCriteria.dataSourceId = project.findDataSourceByTitle('Explosion model').id;
            subCriteria.description  = 'Repair time is dependent on the type of damage';
            subCriteria.userWeight   = 3;
            subCriteria.addOption('no repair time needed', 1);

            var option         = subCriteria.addOption('up to 1 week', .8);
            option.description = 'No structural and less than up to 100m2 façade/floor damages etc.';
            option             = subCriteria.addOption('up to 1 month', .5);
            option.description = 'Very light structural damage up to 1000m2 façade/floor damages etc.';
            option             = subCriteria.addOption('up to 1 year', .2);
            option.description = 'Significant structural damage more than 1000m2 damage.';
            option             = subCriteria.addOption('unrepairable', 0);
            option.description = 'Column failures or collapse ';
            criteria.addSubCriteria(subCriteria);

            subCriteria              = new Criteria();
            subCriteria.title        = 'Physical Usability';
            subCriteria.dataSourceId = project.findDataSourceByTitle('Explosion model').id;
            subCriteria.description  = 'Type of damage and location of damage';
            subCriteria.userWeight   = 4;
            option                   = subCriteria.addOption('no reduction in usability', 1);
            option.description       = 'no damage';
            option                   = subCriteria.addOption('up to 100m2 cannot be used', .8);
            option.description       = 'up to 100m2 not safely accessible/functional.';
            option                   = subCriteria.addOption('between 101 and 500 m2 cannot be used', .5);
            option.description       = 'up to 500m2 not safely accessible/functional.';
            option                   = subCriteria.addOption('more than 500m2 cannot be used', .2);
            option.description       = 'more than 500m2 not safely accessible/functional';
            criteria.addSubCriteria(subCriteria);

            subCriteria             = new Criteria();
            subCriteria.title       = 'Operational Usability';
            subCriteria.description = 'type of damage to services and location of damage';
            subCriteria.userWeight  = 1;
            subCriteria.addOption('all services available', 1);
            subCriteria.addOption('some services available, work around possible', .5);
            subCriteria.addOption('limited services available, but livable ', .2);
            subCriteria.addOption('too much services out of order or critical service(s) out of order', 0);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);

            // Safety
            criteria               = new Criteria();
            criteria.title         = 'Safety';
            criteria.userWeight    = 3;
            subCriteria            = new Criteria();
            subCriteria.title      = 'Victims';
            subCriteria.userWeight = 1;
            subCriteria.addOption('no victims', 1);
            subCriteria.addOption('only light injuries', .7);
            subCriteria.addOption('heavy injuries up to 10 people including possible lethality', .4);
            subCriteria.addOption('heavy injuries up to 50 people including possible lethality', .2);
            subCriteria.addOption('heavy injuries more than 50 people including possible lethality', 0);
            criteria.addSubCriteria(subCriteria);
            subCriteria            = new Criteria();
            subCriteria.title      = 'Evacuation time';
            subCriteria.userWeight = 1;
            subCriteria.addOption('up to 5 minutes', 1);
            subCriteria.addOption('up to 10 minutes', .6);
            subCriteria.addOption('more than 10 minutes', .2);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);

            // Security
            criteria               = new Criteria();
            criteria.title         = 'Security';
            criteria.userWeight    = 1;
            subCriteria            = new Criteria();
            subCriteria.title      = 'Accessibility';
            subCriteria.userWeight = 1;
            subCriteria.addOption('all access', .2);
            subCriteria.addOption('partial access', .6);
            subCriteria.addOption('all private access', 1);
            criteria.addSubCriteria(subCriteria);
            subCriteria            = new Criteria();
            subCriteria.title      = 'Surveilance';
            subCriteria.userWeight = 1;
            subCriteria.addOption('no monitoring', 0);
            subCriteria.addOption('monitoring access', .4);
            subCriteria.addOption('video monitoring', .7);
            subCriteria.addOption('security check', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);

            // Iconic
            criteria               = new Criteria();
            criteria.title         = 'Iconic';
            criteria.userWeight    = 1;
            subCriteria            = new Criteria();
            subCriteria.title      = 'Impact';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);

            // Functionality
            criteria               = new Criteria();
            criteria.title         = 'Functionality';
            criteria.userWeight    = 1;
            subCriteria            = new Criteria();
            subCriteria.title      = 'Functionality';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);

            // Energy-efficiency
            criteria               = new Criteria();
            criteria.title         = 'Energy-efficiency';
            criteria.userWeight    = 1;
            subCriteria            = new Criteria();
            subCriteria.title      = 'Energy-efficiency';
            subCriteria.userWeight = 1;
            subCriteria.addOption('Low', 0.2);
            subCriteria.addOption('Medium', 0.6);
            subCriteria.addOption('High', 1);
            criteria.addSubCriteria(subCriteria);
            criteria.calculateWeights();
            project.criterias.push(criteria);

            // Scenarios
            // Scenario: Natural events
            var scenario        = new Scenario();
            scenario.title      = 'Natural events';
            scenario.userWeight = 1;

            var subScenario            = new Scenario();
            subScenario.title          = 'Extreme wind load';
            subScenario.userWeight     = 2;
            var subSubScenario         = new Scenario();
            subSubScenario.title       = 'Force 1';
            subSubScenario.description = 'Description';
            subSubScenario.userWeight  = 5;
            //subSubScenario.effectedCriteriaIds.push(project.findCriteriaByTitle('Repair time').id);
            //subSubScenario.effectedCriteriaIds.push(project.findCriteriaByTitle('Physical Usability').id);
            //subSubScenario.effectedCriteriaIds.push(project.findCriteriaByTitle('Operational Usability').id);
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario             = new Scenario();
            subSubScenario.title       = 'Force 2';
            subSubScenario.userWeight  = 3;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario             = new Scenario();
            subSubScenario.title       = 'Force 3';
            subSubScenario.userWeight  = 1;
            subScenario.subScenarios.push(subSubScenario);
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Extreme temperature';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Flooding';
            subScenario.userWeight = 4;
            scenario.subScenarios.push(subScenario);

            subScenario               = new Scenario();
            subScenario.title         = 'Seismic';
            subScenario.userWeight    = 0;
            subSubScenario            = new Scenario();
            subSubScenario.title      = 'Seismic 1';
            subSubScenario.userWeight = 5;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario            = new Scenario();
            subSubScenario.title      = 'Seismic 2';
            subSubScenario.userWeight = 3;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario            = new Scenario();
            subSubScenario.title      = 'Seismic 3';
            subSubScenario.userWeight = 1;
            subScenario.subScenarios.push(subSubScenario);
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Wind and Flood';
            subScenario.userWeight = 3;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Flood and contamination';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);
            scenario.calculateWeights();
            project.scenarios.push(scenario);

            // Intended incidents (terrorists)
            scenario            = new Scenario();
            scenario.title      = 'Intended incidents (terrorists)';
            scenario.userWeight = 2;

            subScenario               = new Scenario();
            subScenario.title         = 'Explosion';
            subScenario.userWeight    = 4;
            subSubScenario            = new Scenario();
            subSubScenario.title      = 'Car bomb external';
            subSubScenario.userWeight = 2;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario            = new Scenario();
            subSubScenario.title      = 'Car bomb in parking garage';
            subSubScenario.userWeight = 4;
            subScenario.subScenarios.push(subSubScenario);
            subSubScenario            = new Scenario();
            subSubScenario.title      = 'Backpack external';
            subSubScenario.userWeight = 1;
            subScenario.subScenarios.push(subSubScenario);
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Impact';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Arson / Fire';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Impact followed by fire';
            subScenario.userWeight = 2;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Chemical / bio attack';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Dirty bomb';
            subScenario.userWeight = 3;
            scenario.subScenarios.push(subScenario);

            scenario.calculateWeights();
            project.scenarios.push(scenario);

            // Unintended incidents
            scenario            = new Scenario();
            scenario.title      = 'Unintended incidents (accidents)';
            scenario.userWeight = 4;

            subScenario            = new Scenario();
            subScenario.title      = 'Explosion';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Impact';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Fire';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Hazmat';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Windload';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            subScenario            = new Scenario();
            subScenario.title      = 'Temperature';
            subScenario.userWeight = 1;
            scenario.subScenarios.push(subScenario);

            scenario.calculateWeights();
            project.scenarios.push(scenario);

            project.rootCriterion.calculateWeights();
            project.rootScenario.calculateWeights();

            for (var i = 0; i < 5; i++) {
                var solution = new Models.Solution();
                solution.title = 'Version ' + (i+1);

                for (var k = 0; k < project.scenarios.length; k++) {
                    var scenario = project.scenarios[k];
                    McaProject.createSolutionForScenario(project, solution, scenario);
                }

                project.solutions.push(solution);
            }

            return project;
        }

        private static createSolutionForScenario(project: McaProject, solution: Solution, scenario: Scenario) {
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
        }

        private static eachCriteria(criterias: Criteria[], scenarioId: string, solution: Solution, parentWeight = 1) {
            var scores = solution.scores;
            for (var k = 0; k < criterias.length; k++) {
                var criteria = criterias[k];
                if (!criteria.isEnabled) continue;
                if (criteria.hasSubcriteria()) {
                    McaProject.eachCriteria(criteria.subCriterias, scenarioId, solution, parentWeight * criteria.weight);
                } else {
                    var random = Math.round(Math.random() * (criteria.options.length - 1));
                    var selectedId = criteria.options[random].id;
                    scores[scenarioId][criteria.id] = {
                        criteriaOptionId: selectedId,
                        value: criteria.getOptionValueById(selectedId),
                        weight: parentWeight * criteria.weight
                    };
                }
            }
        }

    }

}