var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Models;
(function (Models) {
    var DataSource = (function () {
        function DataSource(title, id) {
            if (!id)
                this.id = Helpers.Utils.createGuid();
            if (title)
                this.title = title;
        }
        DataSource.prototype.fromJson = function (data) {
            this.id = data.id;
            this.title = data.title;
        };
        return DataSource;
    })();
    Models.DataSource = DataSource;
    var DataSourceViewModel = (function (_super) {
        __extends(DataSourceViewModel, _super);
        function DataSourceViewModel(title, id, group, filter) {
            _super.call(this, title, id);
            this.title = title;
            this.id = id;
            this.group = group;
            this.filter = filter;
        }
        return DataSourceViewModel;
    })(Models.DataSource);
    Models.DataSourceViewModel = DataSourceViewModel;
})(Models || (Models = {}));
