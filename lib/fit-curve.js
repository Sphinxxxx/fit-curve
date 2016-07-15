/*
  JavaScript implementation of
  Algorithm for Automatically Fitting Digitized Curves
  by Philip J. Schneider
  "Graphics Gems", Academic Press, 1990

  The MIT License (MIT)

  Original (C):
      https://github.com/erich666/GraphicsGems/blob/master/gems/FitCurves.c
  -> Python:
      https://github.com/volkerp/fitCurves
  -> CoffeeScript/JavaScript + math.js/lodash:
      https://github.com/soswow/fit-curves
  -> JavaScript (ES6-ish), no dependencies
      https://github.com/Sphinxxxx/fit-curve
*/
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    if (typeof module === "object" && module.exports) {
      module.exports = factory();
    } else {
      root.fitCurve = factory();
    }
  }
})(this, function() {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var maths = function() {
    function maths() {
      _classCallCheck(this, maths);
    }
    maths.zeros_Xx2x2 = function zeros_Xx2x2(x) {
      var zs = [];
      while (x--) {
        zs.push([0, 0]);
      }
      return zs;
    };
    maths.mulItems = function mulItems(items, multiplier) {
      return [items[0] * multiplier, items[1] * multiplier];
    };
    maths.mulMatrix = function mulMatrix(m1, m2) {
      return m1[0] * m2[0] + m1[1] * m2[1];
    };
    maths.subtract = function subtract(arr1, arr2) {
      return [arr1[0] - arr2[0], arr1[1] - arr2[1]];
    };
    maths.addArrays = function addArrays(arr1, arr2) {
      return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
    };
    maths.addItems = function addItems(items, addition) {
      return [items[0] + addition, items[1] + addition];
    };
    maths.sum = function sum(items) {
      return items.reduce(function(sum, x) {
        return sum + x;
      });
    };
    maths.dot = function dot(m1, m2) {
      return maths.mulMatrix(m1, m2);
    };
    maths.vectorLen = function vectorLen(v) {
      var a = v[0], b = v[1];
      return Math.sqrt(a * a + b * b);
    };
    maths.divItems = function divItems(items, divisor) {
      return [items[0] / divisor, items[1] / divisor];
    };
    maths.squareItems = function squareItems(items) {
      var a = items[0], b = items[1];
      return [a * a, b * b];
    };
    maths.normalize = function normalize(v) {
      return this.divItems(v, this.vectorLen(v));
    };
    return maths;
  }();
  var bezier = function() {
    function bezier() {
      _classCallCheck(this, bezier);
    }
    bezier.q = function q(ctrlPoly, t) {
      var tx = 1 - t;
      var pA = maths.mulItems(ctrlPoly[0], tx * tx * tx), pB = maths.mulItems(ctrlPoly[1], 3 * tx * tx * t), pC = maths.mulItems(ctrlPoly[2], 3 * tx * t * t), pD = maths.mulItems(ctrlPoly[3], t * t * t);
      return maths.addArrays(maths.addArrays(pA, pB), maths.addArrays(pC, pD));
    };
    bezier.qprime = function qprime(ctrlPoly, t) {
      var tx = 1 - t;
      var pA = maths.mulItems(maths.subtract(ctrlPoly[1], ctrlPoly[0]), 3 * tx * tx), pB = maths.mulItems(maths.subtract(ctrlPoly[2], ctrlPoly[1]), 6 * tx * t), pC = maths.mulItems(maths.subtract(ctrlPoly[3], ctrlPoly[2]), 3 * t * t);
      return maths.addArrays(maths.addArrays(pA, pB), pC);
    };
    bezier.qprimeprime = function qprimeprime(ctrlPoly, t) {
      return maths.addArrays(maths.mulItems(maths.addArrays(maths.subtract(ctrlPoly[2], maths.mulItems(ctrlPoly[1], 2)), ctrlPoly[0]), 6 * (1 - t)), maths.mulItems(maths.addArrays(maths.subtract(ctrlPoly[3], maths.mulItems(ctrlPoly[2], 2)), ctrlPoly[1]), 6 * t));
    };
    return bezier;
  }();
  function fitCurve(points, maxError) {
    var len = points.length, leftTangent = createTangent(points[1], points[0]), rightTangent = createTangent(points[len - 2], points[len - 1]);
    return fitCubic(points, leftTangent, rightTangent, maxError);
  }
  function fitCubic(points, leftTangent, rightTangent, error) {
    var MaxIterations = 20;
    var bezCurve, u, uPrime, maxError, splitPoint, centerVector, toCenterTangent, fromCenterTangent, beziers, dist, i;
    if (points.length === 2) {
      dist = maths.vectorLen(maths.subtract(points[0], points[1])) / 3;
      bezCurve = [points[0], maths.addArrays(points[0], maths.mulItems(leftTangent, dist)), maths.addArrays(points[1], maths.mulItems(rightTangent, dist)), points[1]];
      return [bezCurve];
    }
    u = chordLengthParameterize(points);
    bezCurve = generateBezier(points, u, leftTangent, rightTangent);
    var _computeMaxError = computeMaxError(points, bezCurve, u);
    maxError = _computeMaxError[0];
    splitPoint = _computeMaxError[1];
    if (maxError < error) {
      return [bezCurve];
    }
    if (maxError < error * error) {
      for (i = 0;i < MaxIterations;i++) {
        uPrime = reparameterize(bezCurve, points, u);
        bezCurve = generateBezier(points, uPrime, leftTangent, rightTangent);
        var _computeMaxError2 = computeMaxError(points, bezCurve, uPrime);
        maxError = _computeMaxError2[0];
        splitPoint = _computeMaxError2[1];
        if (maxError < error) {
          return [bezCurve];
        }
        u = uPrime;
      }
    }
    beziers = [];
    centerVector = maths.subtract(points[splitPoint - 1], points[splitPoint + 1]);
    if (centerVector[0] || centerVector[1]) {
      toCenterTangent = maths.normalize(centerVector);
      fromCenterTangent = maths.mulItems(toCenterTangent, -1);
    } else {
      toCenterTangent = createTangent(points[splitPoint - 1], points[splitPoint]);
      fromCenterTangent = createTangent(points[splitPoint + 1], points[splitPoint]);
    }
    beziers = beziers.concat(fitCubic(points.slice(0, splitPoint + 1), leftTangent, toCenterTangent, error));
    beziers = beziers.concat(fitCubic(points.slice(splitPoint), fromCenterTangent, rightTangent, error));
    return beziers;
  }
  function generateBezier(points, parameters, leftTangent, rightTangent) {
    var bezCurve, A, a, C, X, det_C0_C1, det_C0_X, det_X_C1, alpha_l, alpha_r, epsilon, segLength, i, len, tmp, u, ux, firstPoint = points[0], lastPoint = points[points.length - 1];
    bezCurve = [firstPoint, null, null, lastPoint];
    A = maths.zeros_Xx2x2(parameters.length);
    for (i = 0, len = parameters.length;i < len;i++) {
      u = parameters[i];
      ux = 1 - u;
      a = A[i];
      a[0] = maths.mulItems(leftTangent, 3 * u * (ux * ux));
      a[1] = maths.mulItems(rightTangent, 3 * ux * (u * u));
    }
    C = [[0, 0], [0, 0]];
    X = [0, 0];
    for (i = 0, len = points.length;i < len;i++) {
      u = parameters[i];
      a = A[i];
      C[0][0] += maths.dot(a[0], a[0]);
      C[0][1] += maths.dot(a[0], a[1]);
      C[1][0] += maths.dot(a[0], a[1]);
      C[1][1] += maths.dot(a[1], a[1]);
      tmp = maths.subtract(points[i], bezier.q([firstPoint, firstPoint, lastPoint, lastPoint], u));
      X[0] += maths.dot(a[0], tmp);
      X[1] += maths.dot(a[1], tmp);
    }
    det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1];
    det_C0_X = C[0][0] * X[1] - C[1][0] * X[0];
    det_X_C1 = X[0] * C[1][1] - X[1] * C[0][1];
    alpha_l = det_C0_C1 === 0 ? 0 : det_X_C1 / det_C0_C1;
    alpha_r = det_C0_C1 === 0 ? 0 : det_C0_X / det_C0_C1;
    segLength = maths.vectorLen(maths.subtract(firstPoint, lastPoint));
    epsilon = 1E-6 * segLength;
    if (alpha_l < epsilon || alpha_r < epsilon) {
      bezCurve[1] = maths.addArrays(firstPoint, maths.mulItems(leftTangent, segLength / 3));
      bezCurve[2] = maths.addArrays(lastPoint, maths.mulItems(rightTangent, segLength / 3));
    } else {
      bezCurve[1] = maths.addArrays(firstPoint, maths.mulItems(leftTangent, alpha_l));
      bezCurve[2] = maths.addArrays(lastPoint, maths.mulItems(rightTangent, alpha_r));
    }
    return bezCurve;
  }
  function reparameterize(bezier, points, parameters) {
    return parameters.map(function(p, i) {
      return newtonRaphsonRootFind(bezier, points[i], p);
    });
  }
  function newtonRaphsonRootFind(bez, point, u) {
    var d = maths.subtract(bezier.q(bez, u), point), qprime = bezier.qprime(bez, u), numerator = maths.mulMatrix(d, qprime), denominator = maths.sum(maths.addItems(maths.squareItems(qprime), maths.mulMatrix(d, bezier.qprimeprime(bez, u))));
    if (denominator === 0) {
      return u;
    } else {
      return u - numerator / denominator;
    }
  }
  function chordLengthParameterize(points) {
    var u = [], currU, prevU, prevP;
    points.forEach(function(p, i) {
      currU = i ? prevU + maths.vectorLen(maths.subtract(p, prevP)) : 0;
      u.push(currU);
      prevU = currU;
      prevP = p;
    });
    u = u.map(function(x) {
      return x / prevU;
    });
    return u;
  }
  function computeMaxError(points, bez, parameters) {
    var dist, maxDist, splitPoint, v, i, count, point, u;
    maxDist = 0;
    splitPoint = points.length / 2;
    for (i = 0, count = points.length;i < count;i++) {
      point = points[i];
      u = parameters[i];
      v = maths.subtract(bezier.q(bez, u), point);
      dist = v[0] * v[0] + v[1] * v[1];
      if (dist > maxDist) {
        maxDist = dist;
        splitPoint = i;
      }
    }
    return [maxDist, splitPoint];
  }
  function createTangent(pointA, pointB) {
    return maths.normalize(maths.subtract(pointA, pointB));
  }
  return fitCurve;
});
