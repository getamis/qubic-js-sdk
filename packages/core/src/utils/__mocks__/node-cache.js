const cacheGetMock = jest.fn();
const cacheSetMock = jest.fn();

module.exports = jest.fn().mockImplementation(() => ({
  get: cacheGetMock,
  set: cacheSetMock,
}));
module.exports.cacheGetMock = cacheGetMock;
module.exports.cacheSetMock = cacheSetMock;
