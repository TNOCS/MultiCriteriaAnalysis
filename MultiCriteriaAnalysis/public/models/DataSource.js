var Models;
(function (Models) {
    /** Can either be a person or a model */
    var DataSource = (function () {
        function DataSource(title) {
            if (title)
                this.title = title;
            this.id = Helpers.Utils.createGuid();
        }
        return DataSource;
    })();
    Models.DataSource = DataSource;
})(Models || (Models = {}));
//# sourceMappingURL=DataSource.js.map
