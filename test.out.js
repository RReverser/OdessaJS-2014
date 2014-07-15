var getTransformer = function () {
        return function (x) {
            return typeof x === 'object' ? x['*'](2) : x * 2;
        }.bind(this);
    }.bind(this);
var transformer = getTransformer();
console.log(transformer(100));
function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.prototype['+'] = function (other) {
    return new Vector(typeof this.x === 'object' ? this.x['+'](other.x) : this.x + other.x, typeof this.y === 'object' ? this.y['+'](other.y) : this.y + other.y);
};
var vector1 = new Vector(1, 2);
var vector2 = new Vector(10, 100);
console.log(typeof vector1 === 'object' ? vector1['+'](vector2) : vector1 + vector2);