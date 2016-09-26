/**
 * Created by root on 21/09/16.
 */
;(function(win, undefined) {
  var GLOBAL = !!win.GLOBAL ? win.GLOBAL : {};
  GLOBAL.namespace = function(nsStr) {
    var parts = nsStr.split("."),
      root = win,
      max;
    for (var i = 0, max = parts.length; i < max; i++) {
      if (typeof root[parts[i]] === "undefined") {
        root[parts[i]] = {};
      }
      root = root[parts[i]];
    }
    return root;
  };
  win.GLOBAL = GLOBAL;
})(window);
