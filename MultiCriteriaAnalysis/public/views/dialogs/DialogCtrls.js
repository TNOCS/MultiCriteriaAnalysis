var DialogCtrls;
(function (DialogCtrls) {
    var GetTitleDialogCtrl = (function () {
        function GetTitleDialogCtrl($scope, $modalInstance, header, title, description) {
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.header = header;
            this.title = title;
            this.description = description;
            $scope.vm = this;
            $scope.header = header;
        }
        GetTitleDialogCtrl.prototype.ok = function () {
            this.$modalInstance.close(this.title);
        };
        GetTitleDialogCtrl.prototype.cancel = function () {
            this.$modalInstance.dismiss('cancel');
        };
        GetTitleDialogCtrl.$inject = [
            '$scope',
            '$modalInstance',
            'header',
            'title',
            'description'
        ];
        return GetTitleDialogCtrl;
    })();
    DialogCtrls.GetTitleDialogCtrl = GetTitleDialogCtrl;
    var ConfirmationDialogCtrl = (function () {
        function ConfirmationDialogCtrl($scope, $modalInstance, header, question) {
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.header = header;
            this.question = question;
            $scope.vm = this;
            $scope.header = header;
            $scope.question = question;
        }
        ConfirmationDialogCtrl.prototype.ok = function () {
            this.$modalInstance.close(true);
        };
        ConfirmationDialogCtrl.prototype.cancel = function () {
            this.$modalInstance.dismiss('cancel');
        };
        ConfirmationDialogCtrl.$inject = [
            '$scope',
            '$modalInstance',
            'header',
            'question'
        ];
        return ConfirmationDialogCtrl;
    })();
    DialogCtrls.ConfirmationDialogCtrl = ConfirmationDialogCtrl;
})(DialogCtrls || (DialogCtrls = {}));
//# sourceMappingURL=DialogCtrls.js.map