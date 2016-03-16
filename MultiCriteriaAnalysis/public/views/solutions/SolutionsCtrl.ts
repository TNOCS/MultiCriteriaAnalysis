module Solutions {
    export interface ISolutionsViewScope extends ng.IScope {
        vm: SolutionsCtrl;
        selectedItem: any;
        toggle: Function;
    }

    export interface IDecisionTree {
        id: string;
        title: string,
        questions: IQuestion;
    }

    export interface IQuestion {
        question: string;
        answers: { [key: string]: IQuestion | string };
    }

    export class SolutionsCtrl {
        public solutions: Models.Solution[];
        public dataSources: Models.DataSourceViewModel[];
        public scenarios: Models.Scenario[];
        public activeScenarios: Models.Scenario[] = [];
        public selectedScenario: Models.Scenario;
        public selectedCriteria: Models.Criteria;
        public activeCriterias: Models.SelectableCriterion[] = [];
        public parentCriteria: Models.Criteria;
        public description: string;
        private activeDecisionTree;
        private activeQuestion: IQuestion;
        private activeQuestionIndex: number;
        private questions: IQuestion[] = [];
        private finalAnswer: string;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            '$modal',
            '$timeout',
            '$log',
            'messageBusService',
            'projectService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            private $scope: ISolutionsViewScope,
            private $modal: any,
            private $timeout: ng.ITimeoutService,
            private $log: ng.ILogService,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            $scope.vm = this;

            if (projectService.project == null) return;

            this.solutions = projectService.project.solutions;
            this.scenarios = projectService.project.scenarios;

            //this.initializeDataSources();
            this.initializeCriteriaWeights();
            this.initializeScenarioWeights();
            this.initializeActiveScenarios(projectService.project.rootScenario);
            this.initializeSolution();

            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            } else if (typeof projectService.activeSolution === 'undefined') {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }
            //this.updateWeightsAndScore();

            $scope.selectedItem = {};

            $scope.toggle = scope => {
                scope.toggle();
            };

            projectService.project.updateScores();

            if (!projectService.activeCriteria) return;
            // Select the scenario using a timeout, so we know for sure that one rendering of GUI has taken place (and the pieChart id is present).
            $timeout(() => this.select(projectService.activeCriteria), 0);
        }

        // private updateWeightsAndScore() {
        //     this.projectService.project.criterias.forEach(criterion => {
        //         this.eachCriteria(this.projectService.project.criterias, 1, criterion);
        //     });
        //     this.activeCriterias = [];
        // }

        private initializeDataSources() {
            this.dataSources = [];
            this.dataSources.push(new Models.DataSourceViewModel('all', '1', 'Show', (value: Models.SelectableCriterion, idx: number) => { return true; }));
            this.dataSources.push(new Models.DataSourceViewModel('unassigned', '2', 'Show', (value: Models.SelectableCriterion, idx: number) => {
                return (value.selectedId == null || value.selectedId.length === 0);
            }));
            this.projectService.project.dataSources.forEach((ds) => {
                this.dataSources.push(new Models.DataSourceViewModel(ds.title, ds.id, 'Filter by model', (value: Models.SelectableCriterion, idx: number) => {
                    return value.criterion.dataSourceId === this.projectService.activeDataSource.id;
                }));
            });

            if (this.projectService.activeDataSource != null) {
                var id = this.projectService.activeDataSource.id;
                for (var i = 0; i < this.dataSources.length; i++) {
                    var ds = this.dataSources[i];
                    if (ds.id !== id) continue;
                    this.projectService.activeDataSource = ds;
                    break;
                }
            }
        }

        private initializeCriteriaWeights() {
            this.projectService.project.updateCriteriaWeights();
        }

        private initializeScenarioWeights() {
            this.projectService.project.rootScenario.calculateWeights();
            var scenario = new Models.Scenario();
            scenario.subScenarios = this.projectService.project.scenarios;
            scenario.calculateWeights();
        }

        /**
         * Initialize the activeScenarios, i.e. the leafs of the scenario trees.
         */
        private initializeActiveScenarios(scenario: Models.Scenario) {
            if (scenario.subScenarios.length === 0) return;
            scenario.subScenarios.forEach((s) => {
                if (s.subScenarios.length === 0)
                    this.activeScenarios.push(s);
                else
                    this.initializeActiveScenarios(s);
            });
        }

        /**s
         * Initialize the active solution (make sure that all scores are initialized)
         */
        private initializeSolution() {
            var sol = this.projectService.activeSolution;
            if (typeof sol === 'undefined' || sol === null) return;
            if (sol.scores === null) sol.scores = {};
            this.projectService.project.criterias.forEach((crit) => {
                if (sol.scores[crit.id] === null) sol.scores[crit.id] = {};
            });
        }

        id(scenario: Models.Scenario, criteria: Models.Criteria) {
            return scenario.id + "-" + criteria.id;
        }

        deleteSolution() {
            Helpers.Utils.deleteDialog(this.$modal, 'Delete solution', 'Are you sure you want to delete the solution \'' + this.projectService.activeSolution.title + '\'?', (ok) => {
                if (!ok) return;
                var solutions = this.projectService.project.solutions;
                var index = solutions.indexOf(this.projectService.activeSolution);
                if (index < 0) return;
                solutions.splice(index, 1);
                this.projectService.activeSolution = solutions.length > 0
                    ? solutions[solutions.length - 1]
                    : null;
            });
        }

        editSolution() {
            Helpers.Utils.editTextDialog(this.$modal, 'Edit title', this.projectService.activeSolution.title, (newTitle) => {
                this.projectService.activeSolution.title = newTitle;
            });
        }

        createNewSolution() {
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/newSolutionDialog.html',
                controller: 'NewSolutionDialogCtrl',
                size: 'sm',
                resolve: {
                    header: () => 'Create a new solution',
                    title: () => '',
                    description: () => '',
                    solutions: () => this.projectService.project.solutions,
                    selectedSolutionId: () => ''
                }
            });

            modalInstance.result.then((data: { title: string, referenceId: string }) => {
                if (!data || !data.title) return;
                var solution = new Models.Solution();
                if (data.referenceId && data.referenceId !== '') {
                    var referenceSolution = this.projectService.findSolutionById(data.referenceId);
                    solution.cloneSolution(referenceSolution);
                }
                solution.title = data.title;
                this.projectService.project.solutions.push(solution);
                this.projectService.activeSolution = solution;
                this.$log.info(this.projectService.project.solutions);
            }, () => {
                this.$log.error('Modal dismissed at: ' + new Date());
            });
        }

        resetCriteria(scenarioId, criteria: Models.SelectableCriterion) {
            var scores = this.projectService.activeSolution.scores;
            delete scores[scenarioId][criteria.id];
        }

        updateCriteria(scenarioId, weight: number, criteria: Models.SelectableCriterion) {
            var scores = this.projectService.activeSolution.scores;
            criteria.calculateWeights();
            var criteriaOptionId = scores[criteria.id][scenarioId]["criteriaOptionId"];
            scores[criteria.id][scenarioId]["value"] = criteria.getOptionValueById(criteriaOptionId);
            scores[criteria.id][scenarioId]["weight"] = weight;
            //this.updateResult();
        }

        select(item: Models.Criteria) {
            if (!item) {
                // Create a pseudo criteria that is the top level
                item = new Models.Criteria(0);
                item.title = "Top level criteria";
                item.subCriterias = this.projectService.project.criterias;
                item.description = '';
            }
            this.selectedCriteria = item;
            this.projectService.activeCriteria = item;
            this.selectedScenario = null;
            this.activeCriterias = [];
            this.parentCriteria = item.findParent(this.projectService.project);
            this.description = item.description || '';
            this.activeQuestion = null;
            this.activeDecisionTree = null;
            // if (item.subScenarios === null || item.subScenarios.length === 0) {
            //     this.eachCriteria(this.projectService.project.criterias);
            // }
            //this.updateResult();
        }


        selectScenario(item: Models.Scenario) {
            if (!item) return;
            this.selectedScenario = item;
        }

        selectDecisionTree() {
            this.activeQuestionIndex = null;
            this.activeQuestion = null;
            this.questions = null;
            this.finalAnswer = null;
            if (!this.selectedCriteria) return;
            var decisionTreeId = this.selectedCriteria.decisionTreeId || this.parentCriteria.decisionTreeId;
            var decisionTree = this.projectService.findDecisionTreeById(decisionTreeId);
            if (!decisionTree || !decisionTree.questions) return;
            this.activeQuestion = decisionTree.questions;
            this.activeQuestionIndex = 0;
            this.questions = [this.activeQuestion];
        }

        answerChanged(answerKey: string, index: number) {
            var answer = this.activeQuestion.answers[answerKey];
            if (typeof answer === 'string') {
                this.finalAnswer = answer;
            } else {
                if (this.finalAnswer) this.finalAnswer = null;
                this.activeQuestion = answer;
                this.questions.push(this.activeQuestion);
                this.activeQuestionIndex += 1;
            }
        }

        // toggleScenario(scenario: Models.Scenario) {
        //     return (scenario === this.selectedCriteria);
        // }

        /**
         * Use the selected data source to filter the results.
         */
        dataSourceFilter = (value: Models.SelectableCriterion, idx: number) => {
            if (this.projectService.activeDataSource == null) return true;
            return this.projectService.activeDataSource.filter(value, idx);
        }

        public downloadCsv() {
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title.replace(/ /g, '_') + '.csv';
            var csv = Models.CsvModel.createCsvTemplate(this.projectService);
            Helpers.Utils.saveData(csv, filename);
        }
    }

}
