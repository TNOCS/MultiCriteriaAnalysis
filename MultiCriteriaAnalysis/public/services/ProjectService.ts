module Services {
    export class ProjectService {
        public projects        : Models.McaProject[];
        public project         : Models.McaProject;
        public activeSolution  : Models.Solution;
        public activeDataSource: Models.DataSourceViewModel;

        constructor() {
            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [];
        }

        createExampleProject() {
            var project = Models.McaProject.createExampleProject();
            this.projects.push(project);
            this.project = project;
        }
    }
}