var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var fs = require('fs');

fs.readFile('test.js', 'utf-8', function (err, code) {
	if (err) throw err;

	var ast = esprima.parse(code, {loc: true});

	ast = estraverse.replace(ast, {
		leave: function (node) {
			if (node.type === 'ArrowFunctionExpression') {
				return {
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
});