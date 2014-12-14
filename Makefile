TESTS = test/*.js
REPORTER_MINIMAL = dot
REPORTER = list

test:
	@NODE_ENV=test NODE_TLS_REJECT_UNAUTHORIZED=0 ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 10000 \
		--growl \
		$(TESTS)


update:
	git submodule update
	npm install

.PHONY: test update

