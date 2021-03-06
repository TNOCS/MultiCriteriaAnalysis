﻿module Services {
    export interface IProjectStore {
        [id: string]: Models.McaProject;
    }

    export class ProjectService {
        static Store = 'ProjectService.store';

        public projects           : IProjectStore;
        public project            : Models.McaProject;
        public activeCriteria     : Models.Criteria;
        public activeScenario     : Models.Scenario;
        public activeDataSource   : Models.DataSourceViewModel;
        public activeSolution     : Models.Solution;
        public compareToSolutions : Models.Solution[] = [];
        public users              : Models.User[] = [];

        public static $inject = [
            'localStorageService'
        ];

        constructor(
            private localStorageService: ng.local.storage.ILocalStorageService
        ) {
            var store = <IProjectStore>localStorageService.get(ProjectService.Store);
            this.projects = store ? store : {};
            // Make sure all projects have an id equal to the key in the store, and that they are actual classes.
            for (let id in this.projects) {
                let p = new Models.McaProject(this.projects[id]);
                if (!p) continue;
                p.id = id;
                this.projects[id] = p;
            }

            // Upload an example project.
            // Make sure that this default project always is the only one by giving it an id="default".
            $.ajax({
                url: 'data/DefaultProject.json',
                async: false,
                dataType: 'json',
                success: (response) => {
                    if (!response.hasOwnProperty('users')) {
                        this.createProject(response);
                    } else {
                        this.createProject(response.project);
                        this.users = response.users;
                    }
                }
            });
        }

        createExampleProject() {
            var project = Models.McaProject.createExampleProject();
            this.projects[project.id] = project;
            this.project = project;
            this.save();
        }

        createProject(project: Models.McaProject) {
            var parsedProject = new Models.McaProject(project);
            this.projects[parsedProject.id] = parsedProject;
            this.project = parsedProject;
            this.save();
        }

        /**
         * Delete the project
         * @method deleteProject
         * @param  {Models.McaProject} project [the project you wish to delete]
         * @return {boolean}                   [Returns true if successfulll, else false]
         */
        deleteProject(project: Models.McaProject) {
            if (!this.projects.hasOwnProperty(project.id)) return false;
            delete this.projects[project.id];
            this.project = null;
            for (let id in this.projects) {
                this.project = this.projects[id];
                return true;
            }
            this.createExampleProject();
            return true;
        }

        save() {
            this.localStorageService.set(ProjectService.Store, this.projects);
        }

        createCsvTemplate() {
            return Models.CsvModel.createCsvTemplate(this);
        }
        
        updateComponentTitles(comp: Models.Component) {            
            this.renameComponentRecursively(this.project.criterias, comp);
        }
        
        renameComponentRecursively(crits: Models.Criteria[], comp: Models.Component) {
            crits.forEach((c) => {
                if (c.subCriterias.length > 0) {
                    this.renameComponentRecursively(c.subCriterias, comp);
                } else {
                    if (c.componentId && c.componentId === comp.id) {
                        c.title = comp.title;
                    }
                }
            });
        }
        
        /** Returns the first decision tree in the projects decision trees of which the ID equals the supplied parameter */
        findDecisionTreeById(decisionTreeId: string): Solutions.IDecisionTree {
            if (!this.project.decisionTrees || this.project.decisionTrees.length === 0) return null;
            return (this.project.decisionTrees.filter((tree)=>{return tree.id === decisionTreeId;}).pop());
        }
        
        /** Returns the first solution in the projects solutions of which the ID equals the supplied parameter */
        findSolutionById(slnId: string): Models.Solution {
            if (!this.project.solutions || this.project.solutions.length === 0) return null;
            return (this.project.solutions.filter((sln)=>{return sln.id === slnId;}).pop());
        }
    }
}
