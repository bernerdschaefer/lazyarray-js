/*
 * LazyArray.js - A JavaScript LazyArray implementation
 *
 * LazyArray.js exposes an 'extend' method, which accepts an object
 * containing methods and properties to apply to the new function
 * it returns. The only required property is a 'load' method, which
 * should return an array.
 *
 * The load function you provided will automatically be called when
 * an iterator function is called. The following functions are
 * wrapped to call your load function: filter, forEach, every, map,
 * some, reduce, and reduceRight.
 *
 * Usage:
 *
 *   var Query = LazyArray.extend({
 *     load: function() {
 *       return [1, 2, 3, 4, 5, 6, 7, 8];
 *     }
 *   });
 *
 *   var query = new Query();
 *   query.loaded // => false
 *   query.length // => 0
 *   query.filter(function(v) { return v % 2 == 0 }) // => [2, 4, 6, 8]
 *   query.loaded // => true
 *   query.length // => 8
 *
 *
 * Copyright (c) 2010 Bernerd Schaefer
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function() {
  LazyArray.prototype = new Array();
  function LazyArray() {
    this.loaded = false;

    // Array iterator functions which should trigger a load for the LazyArray.
    var iterators = 'filter forEach every map some reduce reduceRight'.split(' ');
    var iteratorFunctions = {};

    iterators.forEach(function(iterator) {
      iteratorFunctions[iterator] = this[iterator];

      // Replace the Array iterator functions with functions that call load() first.
      this[iterator] = function(fn) {
        this.load();
        return this[iterator].call(this, fn);
      };
    }, this);

    this.load = function() {
      if ( this.loaded) return;
      this.loaded = true;

      Array.prototype.push.apply(this, arguments);

      // Replace the lazy loading iterators with the original iterator functions.
      iterators.forEach(function(iterator) {
        this[iterator] = iteratorFunctions[iterator];
      }, this);

      return this;
    }
  }

  LazyArray.extend = function(props) {
    if ( !props.load )
      throw("LazyArray.extend() called with no load function");

    var prototype = new LazyArray();

    var load = props.load;
    delete props.load

    var fn = function() {
      for ( var key in props ) {
        this[key] = props[key]
      }

      this.load = function() {
        // Call the user supplied load function
        var results = load.apply(this, arguments);

        // Pass the results of the user's load function to
        // the LazyArray load function.
        return prototype.load.apply(this, results);
      }
    }

    fn.prototype = prototype;
    return fn;
  }

  window.LazyArray = LazyArray;
})();
