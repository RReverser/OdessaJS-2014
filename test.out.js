var getTransformer = function () {
    return function (x) {
        return x * 2;
    };
};
var transformer = getTransformer();
console.log(transformer(100));