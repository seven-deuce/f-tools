# f-tools: Essential tools for functional programming in JavaScript
This small library will provide you with methods that are required for functional programming, but are not natively   supported in JavaScript.
## Installation
`npm install f-tools --save`

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

## .pipe()
`firstValue.pipe(function)`

You can pipe any data-type to another data-type with .pipe() method, provided that:
* The `firstValue` cannot be `null` or `undefined`. If you need to pass these values, use `f.pipe` method, explained here.
* The `firstValue` will be passed into the function that you pass to `.pip()`. This function, must be a **unary function**. A unary function accepts only one argument and always returns a value.
* for all practical reasons, javascript `Set` will be converted to `Array` and `Map` to `Object`. If you want to perserve the Set and Map datatype during this process, use `f.pipe` method, explained here. 

See examples below which use `.pipe()` to write declarative code:

```
const f = require("f-tools")

//example 1
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
// in example3, we are doing lazy evaluation, because the functions will be chained but not called, until we invoke them with arguments


//A Set will be converted to an array
const set = new Set([1, 2, 3])
const example4 = set.pipe(sum)
console.log(example4) // 6


//A Map will be converted to an Object
const map = new Map([["firstName", "Marlon"], ["lastName", "Brando"]])
const example5 = map.pipe(getValues)
console.log(example5) // ["Marlon", "Brando"]
```
