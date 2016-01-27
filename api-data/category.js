// 获取分类信息数据

module.exports = function* () {
  return yield App.mongo.category.find().get();
};
