module('LazyArray');
test("prototype", function() {
  same(new Array(), LazyArray.prototype, "is Array");
});

test("before load", function() {
  var lazy_array = new LazyArray();

  equal(lazy_array.loaded, false, "loaded should be false");
  equal(lazy_array.length, 0, "it should be empty");

  notEqual(Array.prototype.filter, lazy_array.filter, "filter should be wrapped");
  notEqual(Array.prototype.forEach, lazy_array.forEach, "forEach should be wrapped");
  notEqual(Array.prototype.every, lazy_array.every, "every should be wrapped");
  notEqual(Array.prototype.map, lazy_array.map, "map should be wrapped");
  notEqual(Array.prototype.some, lazy_array.some, "some should be wrapped");
  notEqual(Array.prototype.reduce, lazy_array.reduce, "reduce should be wrapped");
  notEqual(Array.prototype.reduceRight, lazy_array.reduceRight, "reduceRight should be wrapped");
});

test("after load", function() {
  var lazy_array = new LazyArray();
  lazy_array.load(1);

  equal(lazy_array.loaded, true, "loaded should be true");
  equal(lazy_array.length, 1, "it should not be empty");

  equal(Array.prototype.filter, lazy_array.filter, "filter should be wrapped");
  equal(Array.prototype.forEach, lazy_array.forEach, "forEach should be wrapped");
  equal(Array.prototype.every, lazy_array.every, "every should be wrapped");
  equal(Array.prototype.map, lazy_array.map, "map should be wrapped");
  equal(Array.prototype.some, lazy_array.some, "some should be wrapped");
  equal(Array.prototype.reduce, lazy_array.reduce, "reduce should be wrapped");
  equal(Array.prototype.reduceRight, lazy_array.reduceRight, "reduceRight should be wrapped");
});

test("extend", function() {
  raises(function() {
    LazyArray.extend({});
  }, "should raise if no load function is defined");

  var myLoadCalled = false
  var myLoad = function() {
    myLoadCalled = true;
    return [1,2,3];
  }

  var myLazyArray = LazyArray.extend({
    property: "a",
    fn: function() { return "b"; },
    load: myLoad
  });
  var extended = new myLazyArray();

  equal(extended.property, "a", "should apply properties");
  equal(extended.fn(), "b", "should apply functions");

  notEqual(extended.load, myLoad, "should wrap my load function");
  extended.load();
  equal(myLoadCalled, true, "should call my load function");
  equal(extended.length, 3, "should update the results");

  extended = new myLazyArray();
  same( extended.filter(function(v){return v == 1}), [1], "should delegate to iterators")
  same( extended.length, 3, "should force a load")
});
