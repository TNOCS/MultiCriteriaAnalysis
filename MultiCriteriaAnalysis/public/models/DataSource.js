var Models;
(function (Models) {
    /** Can either be a person or a model */
    var DataSource = (function () {
        function DataSource(title) {
            this.id = Helpers.Utils.createGuid();
            if (title)
                this.title = title;
        }
        /** Deserialize the object */
        DataSource.prototype.fromJson = function (data) {
            this.id = data.id;
            this.title = data.title;
        };
        return DataSource;
    })();
    Models.DataSource = DataSource;
})(Models || (Models = {}));
//# sourceMappingURL=DataSource.js.map
