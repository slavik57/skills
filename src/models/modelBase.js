"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bookshelf_1 = require('../../bookshelf');
var ModelBase = (function (_super) {
    __extends(ModelBase, _super);
    function ModelBase() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ModelBase.prototype, "idAttribute", {
        get: function () { return ModelBase.idAttribute; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModelBase, "idAttribute", {
        get: function () { return 'id'; },
        enumerable: true,
        configurable: true
    });
    return ModelBase;
}(bookshelf_1.bookshelf.Model));
exports.ModelBase = ModelBase;
//# sourceMappingURL=modelBase.js.map