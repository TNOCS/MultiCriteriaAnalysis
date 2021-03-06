﻿module DialogCtrls {
    export interface IGetTitleDialogScope extends ng.IScope {
        vm: GetTitleDialogCtrl;
        header: string;
    }

    export class GetTitleDialogCtrl {
        public static $inject = [
            '$scope',
            '$modalInstance',
            'header',
            'title',
            'description'
        ];

        constructor(
            private $scope: IGetTitleDialogScope,
            private $modalInstance: any,
            private header: string,
            public title: string,
            public description: string) {

            $scope.vm = this;
            $scope.header = header;
        }

        public ok() {
            this.$modalInstance.close(this.title);
        }

        public cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }


    export interface IConfirmationDialogScope extends ng.IScope {
        vm: ConfirmationDialogCtrl;
        header: string;
        question: string;
    }

    export class ConfirmationDialogCtrl {
        public static $inject = [
            '$scope',
            '$modalInstance',
            'header',
            'question'
        ];

        constructor(
            private $scope: IConfirmationDialogScope,
            private $modalInstance: any,
            private header: string,
            private question: string) {

            $scope.vm = this;
            $scope.header = header;
            $scope.question = question;
        }

        public ok() {
            this.$modalInstance.close(true);
        }

        public cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }

    export interface IChooseDecisionTreeDialogScope extends ng.IScope {
        vm: ChooseDecisionTreeDialogCtrl;
        header: string;
    }

    export class ChooseDecisionTreeDialogCtrl {
        public static $inject = [
            '$scope',
            '$modalInstance',
            'header',
            'title',
            'description',
            'trees',
            'selectedTreeId'
        ];

        constructor(
            private $scope: IChooseDecisionTreeDialogScope,
            private $modalInstance: any,
            private header: string,
            public title: string,
            public description: string,
            public trees: Solutions.IDecisionTree[],
            public selectedTreeId: string) {

            $scope.vm = this;
            $scope.header = header;
        }

        public ok() {
            this.$modalInstance.close(this.selectedTreeId);
        }

        public cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }

    export interface INewSolutionDialogScope extends ng.IScope {
        vm: NewSolutionDialogCtrl;
        header: string;
    }

    export class NewSolutionDialogCtrl {
        public static $inject = [
            '$scope',
            '$modalInstance',
            'header',
            'title',
            'description',
            'solutions',
            'selectedSolutionId'
        ];

        constructor(
            private $scope: INewSolutionDialogScope,
            private $modalInstance: any,
            private header: string,
            public title: string,
            public description: string,
            public solutions: Models.Solution[],
            public selectedSolutionId: string) {

            $scope.vm = this;
            $scope.header = header;
        }

        public ok() {
            this.$modalInstance.close({ title: this.title, referenceId: this.selectedSolutionId });
        }

        public cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }
}