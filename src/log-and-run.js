/*
	Only a utility used for investigating existing code.
	Not needed to build fit-curve.js
*/
function logAndRun(func, log) {
	//return func;
	
	if(!log) {
		(this || self)._loggedAndRun = log = {};
	}
	
	function argType(arg) {
		if(Array.isArray(arg)) {
			return '['+ arg.map(argType).join(',') +']';
		}
		else if(Number.isFinite(arg)) {
			return 'num';
		}
		else {
			return '???' + arg;
		}
	}
	
	return function() {
		//http://www.codeovertones.com/2011/08/how-to-print-stack-trace-anywhere-in.html
		var e = new Error('dummy');
		var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
						   .replace(/^\s+at\s+/gm, '')
						   .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
						   .split('\n');

		var result = func.apply(null, arguments);

		var signature = func.name + ': ' + Array.from(arguments).map(argType).join(', ') + '  ('+ stack[0] +')';
		var context = func.name + ': ' + Array.from(arguments).join(' ') + ' => ' + result;
		
		log[signature] = log[signature] || [];
		log[signature].push(context);
		
		return result;
	}
}
