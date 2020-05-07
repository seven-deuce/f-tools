const f = {}

const reach4Objects = function(object, path, undefinedValue = undefined) {
	if (!path)
		return new Error("f.reach() needs a path argument as second parameter that could be a String or Array")
	if (typeof path !== "string" && !Array.isArray(path))
		return new Error("f.reach() needs a path argument as second parameter that could be a String or Array")
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
		else if (path.length === 1 && input[path[0]] !== undefined) return input[path[0]]

		input = input[path[0]]
		return search(path.slice(1), input)
	}
	return search(path)
}

const reach4Arrays = function(object, path, undefinedValue = undefined) {
	if (!path)
		return new Error("f.reach() needs a path argument as second parameter that could be a String or Array")
	if (typeof path !== "string" && !Array.isArray(path))
		return new Error("f.reach() needs a path argument as second parameter that could be a String or Array")
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
		else if (path.length === 1 && input[path[0]] !== undefined) return input[path[0]]

		input = input[path[0]]
		return search(path.slice(1), input)
	}
	return search(path)
}

f.reach = function(data, path, undefinedValue) {
	if (Array.isArray(data)) return reach4Arrays(data, path, undefinedValue)
	else if (typeof data === "object") return reach4Objects(data, path, undefinedValue)
	else return new Error("The first argument for f.reach() must be an array or object.")
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
	if (args.length === 1 && Array.isArray(args[0])) args = f.flatten([...arguments])

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
	if (args.length === 1 && Array.isArray(args[0])) return args[0]
	else return args
}

f.curry = function(fn) {
	if (typeof fn !== "function") return new Error("The argument passed to f.curry() must be a function.")
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

function createKey(arr) {
	if (arr.length === 0) return ">>>No argument<<<"
	arr = arr.map((item) => {
		if (item === undefined) return ">>>undefined<<<"
		else if (item === null) return ">>>null<<<"
		else if (Array.isArray(item)) return Object.entries(createKey(item)).join("*&$%")
		else if (item instanceof Set) return "s&E&&t" + createKey([...item]) + "s&E&&t"
		else if (item instanceof Map) return "m**A$%p" + createKey([...item]) + "m**A$%p"
		else if (typeof item === "object") return "_^&##" + Object.entries(item).join("_^&##") + "_^&##"
		else if (typeof item === "string") return ")))" + item + "((("
		else return item
	})
	return arr.join("#%&@^#")
}

f.memoize = function(fn) {
	if (typeof fn !== "function") return new Error("The argument passed to f.memoize() must be a function.")
	if (!fn._cache) fn._cache = {}

	return function(arg) {
		const key = createKey([...arguments])
		fn._cache[key] = fn._cache[key] || fn.apply(undefined, arguments)
		return fn._cache[key]
	}
}

f.memoizeX = function(fn) {
	if (typeof fn !== "function") return new Error("The argument passed to f.memoizeX() must be a function.")
	const cache = {}
	return function() {
		const key = createKey([...arguments])
		if (cache[key]) return cache[key]
		cache[key] = fn.apply(undefined, arguments)
		return cache[key]
	}
}

Function.prototype.memoize = function() {
	const _cache = {}
	const fn = this
	return function() {
		const key = createKey([...arguments])
		if (_cache[key]) return _cache[key]
		_cache[key] = fn.apply(undefined, arguments)
		return _cache[key]
	}
}

module.exports = Object.freeze ? Object.freeze(f) : f