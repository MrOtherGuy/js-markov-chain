# js-markov-chain

Simple markov-chain builder. The whole markov-chain logic is in `js/markov.js` - other files are just for demonstration purposes.

## How to use?

First create a new instance of the builder:

```js-markov-chain
let MC = new MarkovChain();
```

This won't be very helpful on it's own - first you'll need to feed it some data from which it can compute probabilities for tokens. For that, the `MarkovChain` provides two methods:

### MarkovChain.build()

```js
// builds the probability data-set from an array of tokens

let array = [1,2,3,4,5,6,7,1,2,234,4,34,56,3,2,...];

MC.build(array)
```

The elements of the array can be whatever, numbers, strings, etc. But they might not eventually compose to anything meaningful unless they are strings.

### MarkovChain.buildFromText()

```js
// builds the probability data-set from a string

let str = "some very and quite a long but still very... ...very long string";

MC.buildFromText(str)
```

This method iterates through an input string and splits to tokens at `.`,`,`,`?`,`!`,`<whitespace>`,`:`and`;`. Each of those gets a token and the "words" each get a token. `.buildFromText()` also makes words lower case so the chain will treat upper and lower case words as equal.

Both of the above just modify the internal state of the MarkovChain instance.

Now, the builder need to be initialized to one of the internal states. Lets' say one of the tokens you added was `"First-state"`. You would then set the initial state with:

```js
MC.init("First-state")
```

You can also call `MC.init()` with no parameter. In that case it will select a random initial state from one of the first added states.

Now it's ready for generating things.

## "Walking" the markov chain

So what happens here? During that building part, the chain generated how likely it is to transition from one state to another state. When we generate stuff we call `MarkovChain.next()` and the chain picks a new random state from weighted probabilities.

Thus, if the current state is `5` and in the input a number `4` almost always appeared after a 5 then during generation a 5-state is very likely to transition to 4-state.

That's just nice to know, you would use it like this:

```js
let my_state = MC.state();
// returns a State object which has a value property

console.log(my_state.value)
<< 5

my_state = MC.update();

// update() returns the new State object
console.log(my_state.value)
<< 4
``` 

In short, `.current()` return the current state of the system - `.next()` transitions first and then returns the new current state.


### Note on states

You can call `.next()` method on a particular state and it will give you the value of the possible nodes it can transition into. But it does DOES NOT modify the internal state of the chain nor give you the node object itself.

```
let my_state = MC.current();
console.log(my_state.value)
<< 5

console.log(my_state.next())
<< 4

```

## Helpers for generating

### MarkovChain.compose()

```js
let text = MC.compose(300);
console.log(text);

// repeatedly calls MC.update() 300 times to construct a string
```

### MarkovChain.makeSentence()

```js
let text = MC.makeSentence(limit);
console.log(text);

// repeatedly calls MC.update() until it hits a token that ends with `.` or `?`
// or `!` or at most `limit` number of times.
// Default limit is 50 - like 50 words.
```

