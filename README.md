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
## API
### .pipe()
`firstValue.pipe(function)`

You can pipe any data-type to another data-type with .pipe() method, provided that:
* The `firstValue` cannot be `null` or `undefined`. If you need to pass these values, use `f.pipe` method, [explained here](https://github.com/seven-deuce/f-tools/blob/master/README.md#fpipe).
* The `firstValue` will be passed into the function that you pass to `.pip()`. This function, must be a **unary function**. A unary function accepts only one argument and always returns a value.
* for all practical reasons, javascript `Set` will be converted to `Array` and `Map` to `Object`. If you want to perserve the Set and Map datatype during this process, use `f.pipe` method, [explained here](https://github.com/seven-deuce/f-tools/blob/master/README.md#fpipe). 

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
`f.pipe(function1 , function2, function3 , ...) 
/* OR: */ f.pipe([function1 , function2, function3 , ...])`

* You can pass as many functions as you want to `f.pipe()`, or, pass an array that includes functions only. It will call each subsequent function with return value of the previous one.
* The first argument (function1) could be any other value as well, like a string or array. If you do that, the subsequent functions will be called immediately with that value and the result will be returned.
* If the first argument (function1) would be a function, it can have any number of arguments.
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
