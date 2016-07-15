Fit one or more cubic Bezier curves to a polyline.
JavaScript implementation of Philip J. Schneider's "Algorithm for Automatically Fitting Digitized Curves" from the book "Graphics Gems".

Ported from C via Python:
* Original (C):
  * https://github.com/erich666/GraphicsGems/blob/master/gems/FitCurves.c
* Python:
  * https://github.com/volkerp/fitCurves
* CoffeeScript/JavaScript + math.js/lodash:
  * https://github.com/soswow/fit-curves

**No dependencies.**

Usage
-----

```javascript
var fitCurve = require('fitCurve');
var points = [[0, 0], [10, 10], [10, 0], [20, 0]];
var error = 50;  //Lower numbers give more accurate curves.

var bezierCurves = fitCurve(points, error);
// bezierCurves[0] === [[0, 0], [20.27317402, 20.27317402], [-1.24665147, 0], [20, 0]]
// where each element is [x, y] and elements are [first-point, control-point-1, control-point-2, second-point] 
```

Demo
----

http://codepen.io/Sphinxxxx/pen/jALxvQ?editors=1011
