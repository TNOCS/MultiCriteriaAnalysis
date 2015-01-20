module Services {
    export class ProjectService {
        public projects        : Models.McaProject[];
        public project         : Models.McaProject;
        public activeSolution  : Models.Solution;
        public activeDataSource: Models.DataSourceViewModel;

        constructor() {
            this.project = Models.McaProject.createExampleProject();
            //this.project = new Models.McaProject();
            //this.project.createDummy();
            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [this.project];
        }
    }
}