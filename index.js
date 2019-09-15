const f = {}

Function.prototype.pipe = function() {
	const before = this
	const next = arguments[0]
	if (typeof next !== "function") throw new Error("The argument given to pipe() must be a function")

	const _placeHolder = Array.from({ length: before.length })

	return function(..._placeHolder) {
		const call = before.apply(undefined, arguments)
		return next(call)
	}
}

Array.prototype.pipe = function() {
	const before = this //an array
	const next = arguments[0] // a function
	if (typeof next !== "function") throw new Error("The argument given to pipe() must be a function")
	return next(before)
}

String.prototype.pipe = function() {
	const before = this //a string
	const next = arguments[0] // a function
	if (typeof next !== "function") throw new Error("The argument given to pipe() must be a function")
	return next(before)
}

Number.prototype.pipe = function() {
	const before = this //a number
	const next = arguments[0] // a function
	if (typeof next !== "function") throw new Error("The argument given to pipe() must be a function")
	return next(before)
}

Object.prototype.pipe = function() {
	const before = this //an object
	const next = arguments[0] // a function
	if (typeof next !== "function") throw new Error("The argument given to pipe() must be a function")
	if(before instanceof Set ) return [...before].pipe(next)	
	else if(before instanceof Map ) return mapToObject(before).pipe(next)
	return next(before)
}

function mapToObject(map) {
	const obj = {}
	map.forEach((value, key) => {
		const entry = {}
		entry[key] = value
		Object.assign(obj, entry)
	})
	return obj
}

function flatten(array) {
  var flattend = [];
  (function flat(array) {
    array.forEach(function(el) {
      if (Array.isArray(el)) flat(el);
      else flattend.push(el);
    });
  })(array);
  return flattend;
}

f.pipe = function() {


	let args = [...arguments]
if(arguments.length === 1 && arguments[0] instanceof Array ) args =  flatten([...arguments])

	if (typeof args[0] === "function") {
		return function() {
			let fn = args[0].apply(undefined, arguments)
			for (let i = 1; i < args.length; i++) {
				fn = args[i](fn)
			}
			return fn
		}
	}
	else {
		let result = args[0]
		for(let i = 1; i < args.length; i++) {
		    result = args[i](result)
		  }
		  return result
	}
}

f.identity = function() {
	const args = [...arguments] 
	if(args.length === 1 && args[0] instanceof Array) return args[0]
		else return args
	
}

f.curry = function(fn) {
	const length = fn.length
	switch (length) {
		case 0:
			return fn
		case 1:
			return fn
		case 2:
			return a1 => a2 => fn.apply(this, [a1, a2])
		case 3:
			return a1 => a2 => a3 => fn.apply(this, [a1, a2, a3, a4])
		case 4:
			return a1 => a2 => a3 => a4 => fn.apply(this, [a1, a2, a3, a4])
		case 5:
			return a1 => a2 => a3 => a4 => a5 => fn.apply(this, [a1, a2, a3, a4, a5])
		case 6:
			return a1 => a2 => a3 => a4 => a5 => a6 => fn.apply(this, [a1, a2, a3, a4, a5, a6])
		case 7:
			return a1 => a2 => a3 => a4 => a5 => a6 => a7 => fn.apply(this, [a1, a2, a3, a4, a5, a6, a7])

		default:
			throw new Error(
				'The function that you are passing to the "curry" method may take up to 7 parameters. Restructure your function and lower the parameters passed into it'
			)
	}
}

f.memoize = function(fn) {
	if (!fn._cache) fn._cache = {}

	return function(arg) {
		const key = [...arguments].join("#%&@^#")
		fn._cache[key] = fn._cache[key] || fn.apply(undefined, arguments)
		return fn._cache[key]
	}
}

f.memoizeX = function(fn) {
	const cache = {}
	return function() {
		const key = [...arguments].join("#%&@^#")
		if (cache[key]) return cache[key]
		cache[key] = fn.apply(undefined, arguments)
		return cache[key]
	}
}

Function.prototype.memoize = function() {
	const _cache = {}
	const fn = this
	return function() {
		const key = [...arguments].join("#%&@^#")
		if (_cache[key]) return _cache[key]
		_cache[key] = fn.apply(undefined, arguments)
		return _cache[key]
	}
}

module.exports = f