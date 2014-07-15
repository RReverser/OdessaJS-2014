var getTransformer = () => x => x * 2;

var transformer = getTransformer();
console.log(transformer(100));

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype['+'] = function (other) {
	return new Vector(this.x + other.x, this.y + other.y);
};

var vector1 = new Vector(1, 2);
var vector2 = new Vector(10, 100);

console.log(vector1 + vector2);