define(["require", "exports", "./Symbol", "./Util", "./Util"], function (require, exports, Symbol_1, Util_1, Util_2) {
    "use strict";
    function choice1Of2(v) {
        return new Choice(0, v);
    }
    exports.choice1Of2 = choice1Of2;
    function choice2Of2(v) {
        return new Choice(1, v);
    }
    exports.choice2Of2 = choice2Of2;
    var Choice = (function () {
        function Choice(tag, a) {
            this.tag = tag;
            this.a = a;
        }
        Object.defineProperty(Choice.prototype, "valueIfChoice1", {
            get: function () {
                return this.tag === 0 ? this.a : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Choice.prototype, "valueIfChoice2", {
            get: function () {
                return this.tag === 1 ? this.a : null;
            },
            enumerable: true,
            configurable: true
        });
        Choice.prototype.Equals = function (other) {
            return Util_2.equalsUnions(this, other);
        };
        Choice.prototype.CompareTo = function (other) {
            return Util_2.compareUnions(this, other);
        };
        Choice.prototype[Symbol_1.default.reflection] = function () {
            return {
                type: "Microsoft.FSharp.Core.FSharpChoice",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: [["Choice1Of2", Util_1.Any], ["Choice2Of2", Util_1.Any]]
            };
        };
        return Choice;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Choice;
});
