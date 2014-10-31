module Services {
    export class ProjectService {
        public projects        : Models.McaProject[];
        public project         : Models.McaProject;
        public activeSolution  : Models.Solution;
        public activeDataSource: Models.DataSource;

        constructor() {
            this.project = new Models.McaProject();
            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [this.project];
        }
    }
}