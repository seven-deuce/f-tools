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
	if (before instanceof Set) return [...before].pipe(next)
	else if (before instanceof Map) return mapToObject(before).pipe(next)
	return next(before)
}

Object.prototype.get = function() {
	const object = Object.assign({}, this)
	const args = [...arguments]
	let path = args[0]
	const undefinedValue = (args[1] === undefined) ?  undefined : args[1]
	if (!path) return new Error(".get() needs a single parameter that could be a String or Array")
	if (typeof path !== "string" && !Array.isArray(path))
		return new Error("The parameter supplied as the first argument to .get() must be an Array or a String")
	if (typeof path === "string") {
		path = path.split(/\[|\]/g) // now an array

		path = path.reduce((a, item) => {
			item = item.replace(/^[\.'"]/, "").replace(/[\.'"]$/, "")
			item = /^\w+\.\d+$/.test(item) ? [item] : item.split(".")

			return item[0] !== "" ? a.concat(item) : a
		}, [])
	}

	function search(path, input = object) {
		if (input[path[0]] === undefined) return undefinedValue
		else if (path.length === 1 && input[path[0]]) return input[path[0]]

		input = input[path[0]]
		return search(path.slice(1), input)
	}
	return search(path)
}

Array.prototype.get = function() {
	const object = [...this]
	const args = [...arguments]
	let path = args[0]
	const undefinedValue = args[1] || undefined
	if (!path) return new Error(".get() needs a single parameter that could be a String or Array")
	if (typeof path !== "string" && !Array.isArray(path))
		return new Error("The parameter supplied as the first argument to .get() must be an Array or a String")
	if (typeof path === "string") {
		path = path.split(/\[|\]/g) // now an array
		path = path.reduce((a, item) => {
			item = item.replace(/^[\.'"]/, "").replace(/[\.'"]$/, "")
			item = /^\w+\.\d+$/.test(item) ? [item] : item.split(".")

			return item[0] !== "" ? a.concat(item) : a
		}, [])
	}

	function search(path, input = object) {
		if (input[path[0]] === undefined) return undefinedValue
		else if (path.length === 1 && input[path[0]]) return input[path[0]]

		input = input[path[0]]
		return search(path.slice(1), input)
	}
	return search(path)
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

f.flatten = function(array) {
	if (!Array.isArray(array)) return array
	var flattend = []
	;(function flat(array) {
		array.forEach(function(el) {
			if (Array.isArray(el)) flat(el)
			else flattend.push(el)
		})
	})(array)
	return flattend
}

f.pipe = function() {
	let args = [...arguments]
	if (arguments.length === 1 && arguments[0] instanceof Array) args = f.flatten([...arguments])

	if (typeof args[0] === "function") {
		return function() {
			let fn = args[0].apply(undefined, arguments)
			for (let i = 1; i < args.length; i++) {
				fn = args[i](fn)
			}
			return fn
		}
	} else {
		let result = args[0]
		for (let i = 1; i < args.length; i++) {
			result = args[i](result)
		}
		return result
	}
}

f.identity = function() {
	const args = [...arguments]
	if (args.length === 1 && args[0] instanceof Array) return args[0]
	else return args
}

f.curry = function(fn) {
	if (fn.length < 2) return fn
	const curry = {}
	curry.args = []
	curry.length = fn.length
	return function waitingForNextArgument() {
		curry.args = Array.from(arguments)
		if (curry.args.length >= curry.length) {
			return fn.apply(undefined, curry.args)
		} else {
			return waitingForNextArgument.bind(undefined, ...curry.args)
		}
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