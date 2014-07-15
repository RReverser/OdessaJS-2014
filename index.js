var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var fs = require('fs');

var code = fs.readFileSync('test.js', 'utf-8');

// parsing original code, preserving locations and linkage to original file
var ast = esprima.parse(code, {
	loc: true,
	source: 'test.js'
});

ast = estraverse.replace(ast, {
	leave: function (node) {
		// Looking for arrow function expressions i.e. (arg1, arg2) => arg1 * arg2
		if (node.type === 'ArrowFunctionExpression') {
			// Replacing them with
			return {
				// calls where
				type: 'CallExpression',
				callee: {
					type: 'MemberExpression',
					// we create simple function expression...
					object: {
						type: 'FunctionExpression',
						// using original function's parameters
						params: node.params,
						// and it's expression, wrapped into { return ... } block
						body: {
							type: 'BlockStatement',
							body: [{
								type: 'ReturnStatement',
								argument: node.body
							}]
						}
					},
					computed: false,
					// ...and .bind(...) it
					property: {
						type: 'Identifier',
						name: 'bind'
					}
				},
				// to current `this` context
				arguments: [{
					type: 'ThisExpression'
				}]
			};
		}

		// Looking for any binary operators
		if (node.type === 'BinaryExpression') {
			return {
				// and replacing them with ternary operator where
				type: 'ConditionalExpression',
				// condition is `typeof (left argument) === 'object'`
				test: {
					type: 'BinaryExpression',
					operator: '===',
					left: {
						type: 'UnaryExpression',
						operator: 'typeof',
						argument: node.left,
						prefix: true
					},
					right: {
						type: 'Literal',
						value: 'object'
					}
				},
				// which results into `left[operator](right)` call if true
				consequent: {
					type: 'CallExpression',
					callee: {
						type: 'MemberExpression',
						computed: true,
						object: node.left,
						property: {
							type: 'Literal',
							value: node.operator
						}
					},
					arguments: [node.right]
				},
				// and original expression if false
				alternate: node
			};
		}
	}
});

// generating resulting code
var output = escodegen.generate(ast, {
	sourceMap: true,
	sourceMapWithCode: true
});

// and writing as code + source map pair
fs.writeFileSync('test.out.js', output.code);
fs.writeFileSync('test.out.js.map', output.map.toString());