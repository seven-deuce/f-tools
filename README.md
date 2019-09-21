<img src="/logo.jpg" />

# f-tools => essential tools for functional programming in JavaScript 


This small library will provide you with methods that are required for functional programming, but are not natively supported in JavaScript.

## Installation
`npm install f-tools --save`

### Browser
`<script src="https://unpkg.com/f-tools@latest/umd/f-tools.min.js"></script>`

All methods will be available on  `f` object, on `window` . You can see them all by trying `console.log(f)`

## Basic usage 
```
const f = require("f-tools")

// a group of functions defined:
const split = str => str.split("")
const toNumber = array => array.map(item => Number(item))
const reduce = array => array.reduce((accumulator, currentValue) => accumulator + currentValue)

const string = "123"

//create a chain of functions that transform the string in each step:
const test = string
	.pipe(split) // ["1" ,"2", "3"]
	.pipe(toNumber) // [1, 2, 3]
	.pipe(reduce) // 6
console.log(test) // 6
```

## Core API

### .pipe()
`firstValue.pipe(function)`

You can pipe any data-type to another data-type with .pipe() method, provided that:
* The `firstValue` cannot be `null` or `undefined`. If you need to pass these values, use `f.pipe` method, [explained here](https://github.com/seven-deuce/f-tools/blob/master/README.md#fpipe).
* The `firstValue` will be passed into the function that you pass to `.pip()`. This function, must be a **unary function**. A unary function accepts only one argument and always returns a value.
* If you need to pipe more than one parameter to the next function, return an object containing all parameters and deconstruct it on the receiving function. 
* For practical reasons, Javascript `Set` will be converted to `Array` and `Map` to `Object`. If you want to preserve the Set and Map data-types during the piping process, use `f.pipe` method, [explained here](https://github.com/seven-deuce/f-tools/blob/master/README.md#fpipe). 

See examples below which use `.pipe()` to write declarative code:

```
const f = require("f-tools")

//functions:
const getValues = obj => Object.values(obj) //object to array
const head = arr => arr[0] // array to anything
const split = string => string.split(" ") // string to array
const count = arr => arr.map(item => item.length) //array to array
const sum = arr => arr.reduce((a, b) => a + b) //array to number
const double = num => num * 2

const example1 = { motto: "I can do anything" }
	.pipe(getValues) // ["I can do anything"]
	.pipe(head) // "I can do anything"
	.pipe(split) // ["I", "can", "do", "anything"]
	.pipe(count) // [1 , 3, 2, 8]
	.pipe(sum) // 14
	.pipe(double) // 28
console.log(example1) // 28

//notice how the result will change if we change the order of functions
const example2 = { motto: "I can do anything" }
	.pipe(getValues) // ["I can do anything"]
	.pipe(count) // [17]
	.pipe(head) // 17
	.pipe(double) // 34
console.log(example2) //34

//You can use .pipe() on functions as well:
const first = (name, gender) => `${name} is a ${gender}`
const second = first => `${first} and he plays football`
const third = second => `${second} and loves pizza`

const example3 = first.pipe(second).pipe(third)
console.log(example3("Alex", "boy")) // Alex is a boy and he plays football and loves pizza
// in example3, we are doing lazy evaluation, because the functions 
// will be chained but not called, until we invoke them with arguments


//A Set will be converted to an array
const set = new Set([1, 2, 3])
const example4 = set.pipe(sum)
console.log(example4) // 6


//A Map will be converted to an Object
const map = new Map([["firstName", "Marlon"], ["lastName", "Brando"]])
const example5 = map.pipe(getValues)
console.log(example5) // ["Marlon", "Brando"]
```

### f.identity()
`f.identity(value)`
You can pass any value to `f.identity()` and it will return to you an array of those arguments.

```
const f = require("f-tools")

const test = f.identity("one", 2, "3")
console.log(test) // ["one", 2, "3"]

```


### f.pipe()
`f.pipe(function1 , function2, function3 , ...)` 
OR: 
`f.pipe([function1 , function2, function3 , ...])`

* You can pass as many functions as you want to `f.pipe()`, or, pass an array that includes functions only. It will call each subsequent function with returned value of the previous one.
* The first argument (`function1`) could be any other value as well, like a string or array. If you do that, the subsequent functions will be called immediately with that value and the result will be returned.
* If the first argument (`function1`) would be a function, it can have any number of arguments.
* All the subsequent functions (function2, function3, ....) must be of unary type: they can take only one parameter, and must return something.
* By using this method, you can pass `null` value between functions, as well. It will not break the code.
* This method will preserve the `Set` and `Map` data-types, as they are.

```
const f = require("f-tools")


//functions:
const getValues = obj => Object.values(obj) //object to array
const head = arr => arr[0] // array to anything
const split = string => string.split(" ") // string to array
const count = arr => arr.map(item => item.length) //array to array
const sum = arr => arr.reduce((a, b) => a + b) //array to number
const double = num => num * 2


const example1 = f.pipe(getValues, head, split, count, sum, double)
// OR: const example1 = f.pipe([getValues, head, split, count, sum, double])
console.log(example1({ motto: "I can do anything" })) // 28


//notice how the result will change if we change the order of functions
const example2 = f.pipe(getValues, count, head, double)
console.log(example2({ motto: "I can do anything" })) //34


// You can pass null between functions
const example3 = f.pipe(
	() => null,
	arg => (arg === null ) ? "It is null" : "Not null!"
	)
console.log(example3()) // "It is null" 


// if the first argument is not a function, 
// then all the chain gets executed immediately
const example4 = f.pipe([1,2,3] , sum)
console.log(example4) // 6


// You can do the above, in lazy form, thus
// avoiding immediate execution with f.identity()
const example4_lazy = f.pipe(f.identity, sum)
console.log(example4_lazy([1, 2, 3])) // 6



//A Set or Map will be passed as it is
const set = new Set([1, 2, 3])
const example5 = f.pipe(
	set,
	arg => arg.has(3)
)
console.log(example5) //true
```

### f.curry(function)
`f.curry(function)`

`f.curry()` takes a function as its argument, and returns a a version of that which is curried. For calling this curried function, you can provide arguments, one at a time, or in any other grouping. 

When the last argument is supplied, the value will be returned, otherwise, it is going to return a function which expects the next argument.

```
const f = require("f-tools")

// without curry
const fullName = (firstName, lastName, description) => `${firstName} ${lastName} ${description}`
console.log(fullName("Haskell", "Curry", "was a mathematician")) // Haskell Curry was a mathematician

// When you have not the lastName and description to supply,
// it will return undefined for those parameters:
console.log(fullName("Haskell")) // Haskell undefined undefined

//with curry
const fullName_curry = f.curry(fullName)
// if you supply only 1 parameter, it will return
// a function that will wait to be called with the next parameter
// until fulfilled:
const fullName_curry_haskell = fullName_curry("Haskell")
console.log(fullName_curry_haskell) // [ Function ]
console.log(fullName_curry_haskell("Curry")("was a mathematician")) // Haskell Curry was a mathematician
console.log(fullName_curry_haskell("")("is a programming language")) // Haskell  is a programming language


// you can pass arguments in any groups
// but the order is important
const addUp = (a, b, c, d, e, f, g) => a + b + c + d + e + f + g
const addUp_curry = f.curry(addUp)
console.log(addUp_curry(1)(2)(3, 4, 5)(6)(7)) //28
console.log(addUp_curry(1)(2, 3, 4, 5, 6)(7)) //28
console.log(addUp(1, 2, 3, 4, 5, 6, 7)) //28

```

### f.memoize()
`f.memoize(function)`

* It will take a function and will return a memoized version of that function. Thus, if you call this function with an argument, the return value of the call, will be cached inside the function's object. Then, if you call this function with the "same" argument, it will return the result from the cache and will not run the function itself.
* If you have a pure function, it is a good idea to memoize it. It will boost your app's performance since the subsequent calls to it with previous arguments, will return instantly.
* You can access the cache object of your function by consoling `function._cache`.

```
const f = require("f-tools")

const doMath = ( number , power ) => Math.pow(number * 1234 / 32.6 + 98 / 78.0001 , power)
const doMath_memoize = f.memoize(doMath)

console.log(doMath_memoize(10101010 , 7)) //1.1946385770936731e+60

// on the second call with the same arguments, the calculations wont run again
// result will be read from cached value
console.log(doMath_memoize(10101010 , 7)) //1.1946385770936731e+60

// You can access the cached items by function._cache
console.log(doMath._cache) // { '10101010#%&@^#7': 1.1946385770936731e+60 }

```

### f.memoizeX()

`f.memoizeX(function)`

* It's same as `f.memoize(function)`, the difference is that the cache object will be hidden and nobody can read it.

```
const f = require("f-tools")

const doMath = ( number , power ) => Math.pow(number * 1234 / 32.6 + 98 / 78.0001 , power)
const doMath_memoizeX = f.memoizeX(doMath)

console.log(doMath_memoizeX(10101010 , 7)) //1.1946385770936731e+60

// But you can not access the cache with f.memoizeX() !
console.log(doMath._cache) // undefined

```

### .memoize()

`[ Function ].memoize()`

Has the same functionality of `f.memoizeX(function)`, but you can easily call it on any function and will memoize it for you.

```
const f = require("f-tools")

const doMath = ( number , power ) => Math.pow(number * 1234 / 32.6 + 98 / 78.0001 , power)
const doMath_memoized = doMath.memoize()

console.log(doMath_memoized(10101010 , 7)) //1.1946385770936731e+60

```

## Other Useful API

### .get()

`{ Object }.get( key , undefinedValue )` OR: 
`[ Array ].get( key, undefinedValue )`

Sometime you need to traverse a deeply nested object or array. If the value that you are looking does not exist in that object/array, you will get `undefined` normally. But if before reaching the last key, any previous key wouldn't exist, then JavaScript will throw an error.

By using `.get()` method for getting your value, you will avoid this error. `.get()` will look for the value that you specified. If it finds it, it will return it, otherwise it will just return `undefined`.

* `key` could be a string or array.
* If you prefer another value to be returned in case of failure, you can pass it as the second value to it (`undefinedValue`).

```
const f = require("f-tools")

const array = [
	{ a: 1 }, 
	{ b: 2 }, 
	[
		{ c: { d: 3 } 
		}
	]
]
console.log(array[2][0].c.d) // 3
console.log(array.get("[2][0].c.d")) // 3
//or:
console.log(array.get([ 2, 0 , "c" , "d" ])) // 3

// in JS, if the value that you are looking for does not
// exist, it will throw an error:
console.log(array[2][1].c.d) // TypeError: Cannot read property 'c' of undefined

// using the .get(), whenever a value could not be found
// it will immediately return undefined and will not throw an error:
console.log(array.get("[2][1].c.d")) // undefined

// If you want .get() to return any other value instead of "undefined"
// you can pass it as the second argument:
console.log(array.get("[2][1].c.d", "Cannot find it!")) // Cannot find it!


const object = {
	a: [
			{
				"a.0": {
					b: 17
				}
			}
		]
	}
console.log(object.a[0]["a.0"].b) // 17
console.log(object.get("a[0]['a.0'].b" )) //17

console.log(object.get("a[0]['a.0']" )) // { b: 17 }
console.log(object.get("a[0][1].b" )) //undefined

console.log(object.get("a[0][1].b" , null)) // null
```
