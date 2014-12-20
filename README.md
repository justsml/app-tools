# app-tools
	
	Miscellaneous modules I often use.
	These probably exist in one form or another, not in the narrow scope I need.
	My goal is *not* to create a bloated 'big utility belt' but to centralize my common modules for NodeJS and the browser.

## Installation

  node:

```
$ npm install https://github.com/justsml/app-tools
```

## Tests

	console/terminal: 

```
$ make test
```

## Usage

### Cache Module
	Class uses MongoDB to implement setItem and getItem cache methods.
	Implements a few requirements I wanted, like a write concern of 0 for the upsert.

> Environment Vars (Optional)
>		MONGOCACHE_URI = 'localhost:27017/cache' (default)

```js
	var Cache = require('app-tools/cache')
	var cache = new Cache(null, 'cache')

	// Example Set Item
	cache.setItem('foo', {foo: 'bar'}, function(err, result) {
		assert.equal(null, err)
	})


```
