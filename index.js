var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var fs = require('fs');

var code = fs.readFileSync('test.js', 'utf-8');

var ast = esprima.parse(code, {
	loc: true,
	source: 'test.js'
});

ast = estraverse.replace(ast, {
	leave: function (node) {
		if (node.type === 'ArrowFunctionExpression') {
			return {
				type: 'CallExpression',
				callee: {
					type: 'MemberExpression',
					object: {
						type: 'FunctionExpression',
						id: node.id,
						params: node.params,
						body: {
							type: 'BlockStatement',
							body: [{
								type: 'ReturnStatement',
								argument: node.body
							}]
						}
					},
					computed: false,
					property: {
						type: 'Identifier',
						name: 'bind'
					}
				},
				arguments: [{
					type: 'ThisExpression'
				}]
			};
		}

		if (node.type === 'BinaryExpression') {
			return {
				type: 'ConditionalExpression',
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
				alternate: node
			};
		}
	}
});

var output = escodegen.generate(ast, {
	sourceMap: true,
	sourceMapWithCode: true
});

fs.writeFileSync('test.out.js', output.code);
fs.writeFileSync('test.out.js.map', output.map.toString());