/* eslint-disable no-array-constructor */
/* eslint-disable prefer-rest-params */

/**
 * Shamelessly copied from stackoverflow: https://stackoverflow.com/a/31023470
 * @param {int} length max size of queue
 * @return {array} bounded queue
 */
module.exports = function BoundedQueue(length) {
  const array = new Array();

  array.push = function() {
    if (this.length >= length) {
      this.shift();
    }
    return Array.prototype.push.apply(this, arguments);
  };

  return array;
};
