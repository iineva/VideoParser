// 数据库模块

var monk = require('monk');

module.exports = function(path, collections) {
  return function * mongo(next) {
    var db = monk(path);
    App.mongo = {};
    collections.forEach(function(c) {
      App.mongo[c] = create(db.get(c));
    });
    yield next;
    db.close();
  }
};

function create(collection) {
  return {
    _self: collection,
    find: function(obj) { this._find = obj; return this; },
    limit: function(x) { this._limit = x; return this; },
    skip: function(x) { this._skip = x; return this; },
    sort: function(obj) { this._sort = obj; return this; },
    get: function* () {
      return yield this._self.find(this._find, {
        limit: this._limit,
        skip: this._skip,
        sort: this._sort
      });
    },
    id: function(id) { return this._self.id(id); },
    findOne: function* (search, opts) { return yield this._self.findOne(search, opts); },
    findById: function* (id, opts) { return yield this._self.findById(id, opts); },
    updateById: function* (id, obj, opts) { return yield this._self.updateById(id, obj, opts); },
    insert: function* (data, opts) { return yield this._self.insert(data, opts); },
    remove: function* (search, opts) { return yield this._self.remove(search, opts); },
    count: function* (query) { return yield this._self.count(query); },
  };
}
