module Dialogs {
    export interface IConfirmationDialogScope extends ng.IScope {
        vm      : ConfirmationDialogCtrl;
        header  : string;
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

            $scope.vm       = this;
            $scope.header   = header;
            $scope.question = question;
        }

        public ok() {
            this.$modalInstance.close(true);
        }

        public cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }
}