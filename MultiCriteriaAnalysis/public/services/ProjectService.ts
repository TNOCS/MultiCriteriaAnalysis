module Services {
    export class ProjectService {
        public project         : Models.McaProject;
        public activeSolution  : Models.Solution;
        public activeDataSource: Models.DataSource;

        constructor() {
            this.project = new Models.McaProject();
        }
    }
}