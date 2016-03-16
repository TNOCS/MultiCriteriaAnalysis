var Solutions;
(function (Solutions) {
    var SolutionsCtrl = (function () {
        function SolutionsCtrl($scope, $modal, $timeout, $log, messageBus, projectService) {
            var _this = this;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.$log = $log;
            this.messageBus = messageBus;
            this.projectService = projectService;
            this.activeScenarios = [];
            this.activeCriterias = [];
            this.questions = [];
            this.answers = [];
            this.dataSourceFilter = function (value, idx) {
                if (_this.projectService.activeDataSource == null)
                    return true;
                return _this.projectService.activeDataSource.filter(value, idx);
            };
            $scope.vm = this;
            if (projectService.project == null)
                return;
            this.solutions = projectService.project.solutions;
            this.scenarios = projectService.project.scenarios;
            this.initializeCriteriaWeights();
            this.initializeScenarioWeights();
            this.initializeActiveScenarios(projectService.project.rootScenario);
            this.initializeSolution();
            if (projectService.project.solutions.length === 0) {
                this.createNewSolution();
            }
            else if (typeof projectService.activeSolution === 'undefined') {
                projectService.activeSolution = projectService.project.solutions[projectService.project.solutions.length - 1];
            }
            $scope.selectedItem = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            projectService.project.updateScores();
            if (!projectService.activeCriteria)
                return;
            $timeout(function () { return _this.select(projectService.activeCriteria); }, 0);
        }
        SolutionsCtrl.prototype.initializeDataSources = function () {
            var _this = this;
            this.dataSources = [];
            this.dataSources.push(new Models.DataSourceViewModel('all', '1', 'Show', function (value, idx) { return true; }));
            this.dataSources.push(new Models.DataSourceViewModel('unassigned', '2', 'Show', function (value, idx) {
                return (value.selectedId == null || value.selectedId.length === 0);
            }));
            this.projectService.project.dataSources.forEach(function (ds) {
                _this.dataSources.push(new Models.DataSourceViewModel(ds.title, ds.id, 'Filter by model', function (value, idx) {
                    return value.criterion.dataSourceId === _this.projectService.activeDataSource.id;
                }));
            });
            if (this.projectService.activeDataSource != null) {
                var id = this.projectService.activeDataSource.id;
                for (var i = 0; i < this.dataSources.length; i++) {
                    var ds = this.dataSources[i];
                    if (ds.id !== id)
                        continue;
                    this.projectService.activeDataSource = ds;
                    break;
                }
            }
        };
        SolutionsCtrl.prototype.initializeCriteriaWeights = function () {
            this.projectService.project.updateCriteriaWeights();
        };
        SolutionsCtrl.prototype.initializeScenarioWeights = function () {
            this.projectService.project.rootScenario.calculateWeights();
            var scenario = new Models.Scenario();
            scenario.subScenarios = this.projectService.project.scenarios;
            scenario.calculateWeights();
        };
        SolutionsCtrl.prototype.initializeActiveScenarios = function (scenario) {
            var _this = this;
            if (scenario.subScenarios.length === 0)
                return;
            scenario.subScenarios.forEach(function (s) {
                if (s.subScenarios.length === 0)
                    _this.activeScenarios.push(s);
                else
                    _this.initializeActiveScenarios(s);
            });
        };
        SolutionsCtrl.prototype.initializeSolution = function () {
            var sol = this.projectService.activeSolution;
            if (typeof sol === 'undefined' || sol === null)
                return;
            if (sol.scores === null)
                sol.scores = {};
            this.projectService.project.criterias.forEach(function (crit) {
                if (sol.scores[crit.id] === null)
                    sol.scores[crit.id] = {};
            });
        };
        SolutionsCtrl.prototype.id = function (scenario, criteria) {
            return scenario.id + "-" + criteria.id;
        };
        SolutionsCtrl.prototype.deleteSolution = function () {
            var _this = this;
            Helpers.Utils.deleteDialog(this.$modal, 'Delete solution', 'Are you sure you want to delete the solution \'' + this.projectService.activeSolution.title + '\'?', function (ok) {
                if (!ok)
                    return;
                var solutions = _this.projectService.project.solutions;
                var index = solutions.indexOf(_this.projectService.activeSolution);
                if (index < 0)
                    return;
                solutions.splice(index, 1);
                _this.projectService.activeSolution = solutions.length > 0
                    ? solutions[solutions.length - 1]
                    : null;
            });
        };
        SolutionsCtrl.prototype.editSolution = function () {
            var _this = this;
            Helpers.Utils.editTextDialog(this.$modal, 'Edit title', this.projectService.activeSolution.title, function (newTitle) {
                _this.projectService.activeSolution.title = newTitle;
            });
        };
        SolutionsCtrl.prototype.createNewSolution = function () {
            var _this = this;
            var modalInstance = this.$modal.open({
                templateUrl: 'views/dialogs/newSolutionDialog.html',
                controller: 'NewSolutionDialogCtrl',
                size: 'sm',
                resolve: {
                    header: function () { return 'Create a new solution'; },
                    title: function () { return ''; },
                    description: function () { return ''; },
                    solutions: function () { return _this.projectService.project.solutions; },
                    selectedSolutionId: function () { return ''; }
                }
            });
            modalInstance.result.then(function (data) {
                if (!data || !data.title)
                    return;
                var solution = new Models.Solution();
                if (data.referenceId && data.referenceId !== '') {
                    var referenceSolution = _this.projectService.findSolutionById(data.referenceId);
                    solution.cloneSolution(referenceSolution);
                }
                solution.title = data.title;
                _this.projectService.project.solutions.push(solution);
                _this.projectService.activeSolution = solution;
                _this.$log.info(_this.projectService.project.solutions);
            }, function () {
                _this.$log.error('Modal dismissed at: ' + new Date());
            });
        };
        SolutionsCtrl.prototype.resetCriteria = function (scenarioId, criteria) {
            var scores = this.projectService.activeSolution.scores;
            delete scores[scenarioId][criteria.id];
        };
        SolutionsCtrl.prototype.updateCriteria = function (scenarioId, weight, criteria) {
            var scores = this.projectService.activeSolution.scores;
            criteria.calculateWeights();
            if (!scores.hasOwnProperty(criteria.id))
                scores[criteria.id] = {};
            if (!scores[criteria.id].hasOwnProperty(scenarioId))
                scores[criteria.id][scenarioId] = {};
            var criteriaOptionId = scores[criteria.id][scenarioId]["criteriaOptionId"];
            scores[criteria.id][scenarioId]["value"] = criteria.getOptionValueById(criteriaOptionId);
            scores[criteria.id][scenarioId]["weight"] = weight;
        };
        SolutionsCtrl.prototype.select = function (item) {
            if (!item) {
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
        };
        SolutionsCtrl.prototype.selectScenario = function (item) {
            if (!item)
                return;
            this.selectedScenario = item;
        };
        SolutionsCtrl.prototype.selectDecisionTree = function () {
            var _this = this;
            this.activeQuestionIndex = null;
            this.activeQuestion = null;
            this.questions = [];
            this.answers = [];
            this.finalAnswer = null;
            if (!this.selectedCriteria)
                return;
            var decisionTreeId = this.selectedCriteria.decisionTreeId || this.parentCriteria.decisionTreeId;
            var decisionTree = this.projectService.findDecisionTreeById(decisionTreeId);
            if (!decisionTree || !decisionTree.questions)
                return;
            var scores = this.projectService.activeSolution.scores;
            if (!this.selectedCriteria.isScenarioDependent) {
                if (scores.hasOwnProperty(this.selectedCriteria.id) && scores[this.selectedCriteria.id].hasOwnProperty('0') && scores[this.selectedCriteria.id][0].hasOwnProperty('decisionTreeAnswers')) {
                    this.answers = scores[this.selectedCriteria.id][0]['decisionTreeAnswers'];
                }
            }
            else {
                if (this.selectedScenario) {
                    if (scores.hasOwnProperty(this.selectedCriteria.id) && scores[this.selectedCriteria.id].hasOwnProperty(this.selectedScenario.id) && scores[this.selectedCriteria.id][this.selectedScenario.id].hasOwnProperty('decisionTreeAnswers')) {
                        this.answers = scores[this.selectedCriteria.id][this.selectedScenario.id]['decisionTreeAnswers'];
                    }
                }
            }
            this.activeQuestion = decisionTree.questions;
            this.activeQuestionIndex = 0;
            this.questions = [this.activeQuestion];
            if (this.answers) {
                this.answers.forEach(function (ans, ind) {
                    _this.answerChanged(ans, ind, false);
                });
            }
            if (this.answers.length === 0)
                this.answers.push('');
            if (this.$scope.$root.$$phase != '$apply' && this.$scope.$root.$$phase != '$digest') {
                this.$scope.$apply();
            }
        };
        SolutionsCtrl.prototype.answerChanged = function (answerKey, index, doSaveAnswer) {
            var _this = this;
            if (doSaveAnswer === void 0) { doSaveAnswer = true; }
            if (doSaveAnswer) {
                if (this.answers.length > this.activeQuestionIndex) {
                    this.answers[this.activeQuestionIndex] = answerKey;
                }
                else if (this.answers.length === this.activeQuestionIndex) {
                    this.answers.push(answerKey);
                }
            }
            var answer = this.activeQuestion.answers[answerKey];
            if (typeof answer === 'string') {
                this.finalAnswer = answer;
                var answerOption = this.selectedCriteria.findOptionByTitle(this.finalAnswer);
                this.$timeout(function () { _this.setScore(_this.selectedCriteria, answerOption), 0; });
            }
            else if (typeof answer === 'object') {
                if (this.finalAnswer)
                    this.finalAnswer = null;
                this.activeQuestion = answer;
                this.questions.push(this.activeQuestion);
                this.activeQuestionIndex += 1;
            }
            else {
                console.log('Unknown answer: ' + answerKey);
            }
        };
        SolutionsCtrl.prototype.setScore = function (item, answerOption) {
            if (!answerOption)
                return;
            if (!item.isScenarioDependent) {
                this.updateCriteria(0, 1, item);
                this.projectService.activeSolution.scores[item.id][0]['criteriaOptionId'] = answerOption.id;
                this.projectService.activeSolution.scores[item.id][0]['decisionTreeAnswers'] = JSON.parse(JSON.stringify(this.answers));
            }
            else {
                this.updateCriteria(this.selectedScenario.id, this.selectedScenario.weight, item);
                this.projectService.activeSolution.scores[item.id][this.selectedScenario.id]['criteriaOptionId'] = answerOption.id;
                this.projectService.activeSolution.scores[item.id][this.selectedScenario.id]['decisionTreeAnswers'] = JSON.parse(JSON.stringify(this.answers));
            }
        };
        SolutionsCtrl.prototype.resetDecisionTree = function () {
            this.answers = [];
            var emptyAnswer = new Models.CriteriaOption(null, null, null, null);
            this.setScore(this.selectedCriteria, emptyAnswer);
            this.selectDecisionTree();
        };
        SolutionsCtrl.prototype.downloadCsv = function () {
            var filename = Helpers.Utils.getDate() + '_' + this.projectService.project.title.replace(/ /g, '_') + '.csv';
            var csv = Models.CsvModel.createCsvTemplate(this.projectService);
            Helpers.Utils.saveData(csv, filename);
        };
        SolutionsCtrl.$inject = [
            '$scope',
            '$modal',
            '$timeout',
            '$log',
            'messageBusService',
            'projectService'
        ];
        return SolutionsCtrl;
    }());
    Solutions.SolutionsCtrl = SolutionsCtrl;
})(Solutions || (Solutions = {}));
