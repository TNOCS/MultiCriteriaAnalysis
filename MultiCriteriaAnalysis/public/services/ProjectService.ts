module Services {
    export class ProjectService {
        public projects        : Models.McaProject[];
        public project         : Models.McaProject;
        public activeCriteria  : Models.Criteria;
        public activeScenario  : Models.Scenario;
        public activeDataSource: Models.DataSourceViewModel;
        public activeSolution  : Models.Solution;
        public altSolution     : Models.Solution;

        constructor() {
            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [];
            // TODO Remove
            this.createExampleProject();
        }

        createExampleProject() {
            var project = Models.McaProject.createExampleProject();
            this.projects.push(project);
            this.project = project;
        }
    }
}