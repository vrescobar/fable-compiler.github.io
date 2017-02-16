define(["require", "exports", "./List", "./List", "./Util", "./GenericComparer", "./Symbol", "./Seq", "./Seq", "./Seq", "./Seq", "./Seq", "./Seq", "./Seq"], function (require, exports, List_1, List_2, Util_1, GenericComparer_1, Symbol_1, Seq_1, Seq_2, Seq_3, Seq_4, Seq_5, Seq_6, Seq_7) {
    "use strict";
    function distinctBy(f, xs) {
        return Seq_6.choose(function (tup) { return tup[0]; }, Seq_7.scan(function (tup, x) {
            var acc = tup[1];
            var k = f(x);
            return acc.has(k) ? [null, acc] : [x, add(k, acc)];
        }, [null, create()], xs));
    }
    exports.distinctBy = distinctBy;
    function distinct(xs) {
        return distinctBy(function (x) { return x; }, xs);
    }
    exports.distinct = distinct;
    var SetTree = (function () {
        function SetTree(tag, a, b, c, d) {
            this.size = arguments.length - 1 | 0;
            this.tag = tag | 0;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        return SetTree;
    }());
    exports.SetTree = SetTree;
    var tree_tolerance = 2;
    function tree_countAux(s, acc) {
        countAux: while (true) {
            if (s.tag === 1) {
                return acc + 1 | 0;
            }
            else if (s.tag === 0) {
                return acc | 0;
            }
            else {
                var _var5 = s.b;
                acc = tree_countAux(s.c, acc + 1);
                s = _var5;
                continue countAux;
            }
        }
    }
    function tree_count(s) {
        return tree_countAux(s, 0);
    }
    function tree_SetOne(n) {
        return new SetTree(1, n);
    }
    function tree_SetNode(x, l, r, h) {
        return new SetTree(2, x, l, r, h);
    }
    function tree_height(t) {
        return t.tag === 1 ? 1 : t.tag === 2 ? t.d : 0;
    }
    function tree_mk(l, k, r) {
        var matchValue = l.tag === 0 ? r.tag === 0 ? 0 : 1 : 1;
        switch (matchValue) {
            case 0:
                return tree_SetOne(k);
            case 1:
                var hl = tree_height(l) | 0;
                var hr = tree_height(r) | 0;
                var m = (hl < hr ? hr : hl) | 0;
                return tree_SetNode(k, l, r, m + 1);
        }
        throw new Error("internal error: Set.tree_mk");
    }
    function tree_rebalance(t1, k, t2) {
        var t1h = tree_height(t1);
        var t2h = tree_height(t2);
        if (t2h > t1h + tree_tolerance) {
            if (t2.tag === 2) {
                if (tree_height(t2.b) > t1h + 1) {
                    if (t2.b.tag === 2) {
                        return tree_mk(tree_mk(t1, k, t2.b.b), t2.b.a, tree_mk(t2.b.c, t2.a, t2.c));
                    }
                    else {
                        throw new Error("rebalance");
                    }
                }
                else {
                    return tree_mk(tree_mk(t1, k, t2.b), t2.a, t2.c);
                }
            }
            else {
                throw new Error("rebalance");
            }
        }
        else {
            if (t1h > t2h + tree_tolerance) {
                if (t1.tag === 2) {
                    if (tree_height(t1.c) > t2h + 1) {
                        if (t1.c.tag === 2) {
                            return tree_mk(tree_mk(t1.b, t1.a, t1.c.b), t1.c.a, tree_mk(t1.c.c, k, t2));
                        }
                        else {
                            throw new Error("rebalance");
                        }
                    }
                    else {
                        return tree_mk(t1.b, t1.a, tree_mk(t1.c, k, t2));
                    }
                }
                else {
                    throw new Error("rebalance");
                }
            }
            else {
                return tree_mk(t1, k, t2);
            }
        }
    }
    function tree_add(comparer, k, t) {
        if (t.tag === 1) {
            var c = comparer.Compare(k, t.a);
            if (c < 0) {
                return tree_SetNode(k, new SetTree(0), t, 2);
            }
            else if (c === 0) {
                return t;
            }
            else {
                return tree_SetNode(k, t, new SetTree(0), 2);
            }
        }
        else if (t.tag === 0) {
            return tree_SetOne(k);
        }
        else {
            var c = comparer.Compare(k, t.a);
            if (c < 0) {
                return tree_rebalance(tree_add(comparer, k, t.b), t.a, t.c);
            }
            else if (c === 0) {
                return t;
            }
            else {
                return tree_rebalance(t.b, t.a, tree_add(comparer, k, t.c));
            }
        }
    }
    function tree_balance(comparer, t1, k, t2) {
        var matchValue = t1.tag === 2 ? t2.tag === 0 ? [1, t1] : t2.tag === 2 ? [2, t1.a, t2] : [2, t1.a, t2] : t1.tag === 1 ? t2.tag === 2 ? [3, t2.a, t1] : t2.tag === 1 ? [4, t1.d, t2.d, t1.a, t2.a, t1.b, t1.c, t2.b, t2.c] : [1, t1] : [0, t2];
        switch (matchValue[0]) {
            case 0:
                return tree_add(comparer, k, matchValue[1]);
            case 1:
                return tree_add(comparer, k, matchValue[1]);
            case 2:
                return tree_add(comparer, k, tree_add(comparer, matchValue[1], matchValue[2]));
            case 3:
                return tree_add(comparer, k, tree_add(comparer, matchValue[1], matchValue[2]));
            case 4:
                if (matchValue[1] + tree_tolerance < matchValue[2]) {
                    return tree_rebalance(tree_balance(comparer, t1, k, matchValue[7]), matchValue[4], matchValue[8]);
                }
                else if (matchValue[2] + tree_tolerance < matchValue[1]) {
                    return tree_rebalance(matchValue[5], matchValue[3], tree_balance(comparer, matchValue[6], k, t2));
                }
                else {
                    return tree_mk(t1, k, t2);
                }
        }
        throw new Error("internal error: Set.tree_balance");
    }
    function tree_split(comparer, pivot, t) {
        if (t.tag === 1) {
            var c = comparer.Compare(t.a, pivot);
            if (c < 0) {
                return [t, false, new SetTree(0)];
            }
            else if (c === 0) {
                return [new SetTree(0), true, new SetTree(0)];
            }
            else {
                return [new SetTree(0), false, t];
            }
        }
        else if (t.tag === 0) {
            return [new SetTree(0), false, new SetTree(0)];
        }
        else {
            var c = comparer.Compare(pivot, t.a);
            if (c < 0) {
                var patternInput = tree_split(comparer, pivot, t.b);
                return [patternInput[0], patternInput[1], tree_balance(comparer, patternInput[2], t.a, t.c)];
            }
            else if (c === 0) {
                return [t.b, true, t.c];
            }
            else {
                var patternInput = tree_split(comparer, pivot, t.c);
                return [tree_balance(comparer, t.b, t.a, patternInput[0]), patternInput[1], patternInput[2]];
            }
        }
    }
    function tree_spliceOutSuccessor(t) {
        if (t.tag === 1) {
            return [t.a, new SetTree(0)];
        }
        else if (t.tag === 2) {
            if (t.b.tag === 0) {
                return [t.a, t.c];
            }
            else {
                var patternInput = tree_spliceOutSuccessor(t.b);
                return [patternInput[0], tree_mk(patternInput[1], t.a, t.c)];
            }
        }
        else {
            throw new Error("internal error: Map.spliceOutSuccessor");
        }
    }
    function tree_remove(comparer, k, t) {
        if (t.tag === 1) {
            var c = comparer.Compare(k, t.a);
            if (c === 0) {
                return new SetTree(0);
            }
            else {
                return t;
            }
        }
        else if (t.tag === 2) {
            var c = comparer.Compare(k, t.a);
            if (c < 0) {
                return tree_rebalance(tree_remove(comparer, k, t.b), t.a, t.c);
            }
            else if (c === 0) {
                var matchValue = [t.b, t.c];
                if (matchValue[0].tag === 0) {
                    return t.c;
                }
                else if (matchValue[1].tag === 0) {
                    return t.b;
                }
                else {
                    var patternInput = tree_spliceOutSuccessor(t.c);
                    return tree_mk(t.b, patternInput[0], patternInput[1]);
                }
            }
            else {
                return tree_rebalance(t.b, t.a, tree_remove(comparer, k, t.c));
            }
        }
        else {
            return t;
        }
    }
    function tree_mem(comparer, k, t) {
        mem: while (true) {
            if (t.tag === 1) {
                return comparer.Compare(k, t.a) === 0;
            }
            else if (t.tag === 0) {
                return false;
            }
            else {
                var c = comparer.Compare(k, t.a) | 0;
                if (c < 0) {
                    comparer = comparer;
                    k = k;
                    t = t.b;
                    continue mem;
                }
                else if (c === 0) {
                    return true;
                }
                else {
                    comparer = comparer;
                    k = k;
                    t = t.c;
                    continue mem;
                }
            }
        }
    }
    function tree_iter(f, t) {
        if (t.tag === 1) {
            f(t.a);
        }
        else {
            if (t.tag === 0) { }
            else {
                tree_iter(f, t.b);
                f(t.a);
                tree_iter(f, t.c);
            }
        }
    }
    function tree_foldBack(f, m, x) {
        return m.tag === 1 ? f(m.a, x) : m.tag === 0 ? x : tree_foldBack(f, m.b, f(m.a, tree_foldBack(f, m.c, x)));
    }
    function tree_fold(f, x, m) {
        if (m.tag === 1) {
            return f(x, m.a);
        }
        else if (m.tag === 0) {
            return x;
        }
        else {
            var x_1 = tree_fold(f, x, m.b);
            var x_2 = f(x_1, m.a);
            return tree_fold(f, x_2, m.c);
        }
    }
    function tree_forall(f, m) {
        return m.tag === 1 ? f(m.a) : m.tag === 0 ? true : (f(m.a) ? tree_forall(f, m.b) : false) ? tree_forall(f, m.c) : false;
    }
    function tree_exists(f, m) {
        return m.tag === 1 ? f(m.a) : m.tag === 0 ? false : (f(m.a) ? true : tree_exists(f, m.b)) ? true : tree_exists(f, m.c);
    }
    function tree_isEmpty(m) {
        return m.tag === 0 ? true : false;
    }
    function tree_subset(comparer, a, b) {
        return tree_forall(function (x) { return tree_mem(comparer, x, b); }, a);
    }
    function tree_psubset(comparer, a, b) {
        return tree_forall(function (x) { return tree_mem(comparer, x, b); }, a) ? tree_exists(function (x) { return !tree_mem(comparer, x, a); }, b) : false;
    }
    function tree_filterAux(comparer, f, s, acc) {
        if (s.tag === 1) {
            if (f(s.a)) {
                return tree_add(comparer, s.a, acc);
            }
            else {
                return acc;
            }
        }
        else if (s.tag === 0) {
            return acc;
        }
        else {
            var acc_1 = f(s.a) ? tree_add(comparer, s.a, acc) : acc;
            return tree_filterAux(comparer, f, s.b, tree_filterAux(comparer, f, s.c, acc_1));
        }
    }
    function tree_filter(comparer, f, s) {
        return tree_filterAux(comparer, f, s, new SetTree(0));
    }
    function tree_diffAux(comparer, m, acc) {
        diffAux: while (true) {
            if (m.tag === 1) {
                return tree_remove(comparer, m.a, acc);
            }
            else if (m.tag === 0) {
                return acc;
            }
            else {
                var _var6 = comparer;
                var _var7 = m.b;
                acc = tree_diffAux(comparer, m.c, tree_remove(comparer, m.a, acc));
                comparer = _var6;
                m = _var7;
                continue diffAux;
            }
        }
    }
    function tree_diff(comparer, a, b) {
        return tree_diffAux(comparer, b, a);
    }
    function tree_union(comparer, t1, t2) {
        var matchValue = t1.tag === 0 ? [1, t2] : t1.tag === 1 ? t2.tag === 0 ? [2, t1] : t2.tag === 1 ? [3, t1.a, t2] : [3, t1.a, t2] : t2.tag === 0 ? [2, t1] : t2.tag === 1 ? [4, t2.a, t1] : [0, t1.d, t2.d, t1.a, t2.a, t1.b, t1.c, t2.b, t2.c];
        switch (matchValue[0]) {
            case 0:
                if (matchValue[1] > matchValue[2]) {
                    var patternInput = tree_split(comparer, matchValue[3], t2);
                    return tree_balance(comparer, tree_union(comparer, matchValue[5], patternInput[0]), matchValue[3], tree_union(comparer, matchValue[6], patternInput[2]));
                }
                else {
                    var patternInput_1 = tree_split(comparer, matchValue[4], t1);
                    return tree_balance(comparer, tree_union(comparer, matchValue[7], patternInput_1[0]), matchValue[4], tree_union(comparer, matchValue[8], patternInput_1[2]));
                }
            case 1:
                return matchValue[1];
            case 2:
                return matchValue[1];
            case 3:
                return tree_add(comparer, matchValue[1], matchValue[2]);
            case 4:
                return tree_add(comparer, matchValue[1], matchValue[2]);
        }
        throw new Error("internal error: Set.tree_union");
    }
    function tree_intersectionAux(comparer, b, m, acc) {
        intersectionAux: while (true) {
            if (m.tag === 1) {
                if (tree_mem(comparer, m.a, b)) {
                    return tree_add(comparer, m.a, acc);
                }
                else {
                    return acc;
                }
            }
            else if (m.tag === 0) {
                return acc;
            }
            else {
                var acc_1 = tree_intersectionAux(comparer, b, m.c, acc);
                var acc_2 = tree_mem(comparer, m.a, b) ? tree_add(comparer, m.a, acc_1) : acc_1;
                comparer = comparer;
                b = b;
                m = m.b;
                acc = acc_2;
                continue intersectionAux;
            }
        }
    }
    function tree_intersection(comparer, a, b) {
        return tree_intersectionAux(comparer, b, a, new SetTree(0));
    }
    function tree_partition1(comparer, f, k, acc1, acc2) {
        return f(k) ? [tree_add(comparer, k, acc1), acc2] : [acc1, tree_add(comparer, k, acc2)];
    }
    function tree_partitionAux(comparer, f, s, acc_0, acc_1) {
        var acc = [acc_0, acc_1];
        if (s.tag === 1) {
            return tree_partition1(comparer, f, s.a, acc[0], acc[1]);
        }
        else if (s.tag === 0) {
            return acc;
        }
        else {
            var acc_2 = tree_partitionAux(comparer, f, s.c, acc[0], acc[1]);
            var acc_3 = tree_partition1(comparer, f, s.a, acc_2[0], acc_2[1]);
            return tree_partitionAux(comparer, f, s.b, acc_3[0], acc_3[1]);
        }
    }
    function tree_partition(comparer, f, s) {
        return tree_partitionAux(comparer, f, s, new SetTree(0), new SetTree(0));
    }
    function tree_minimumElementAux(s, n) {
        return s.tag === 1 ? s.a : s.tag === 0 ? n : tree_minimumElementAux(s.b, s.a);
    }
    function tree_minimumElementOpt(s) {
        return s.tag === 1 ? s.a : s.tag === 0 ? null : tree_minimumElementAux(s.b, s.a);
    }
    function tree_maximumElementAux(s, n) {
        return s.tag === 1 ? s.a : s.tag === 0 ? n : tree_maximumElementAux(s.c, s.a);
    }
    function tree_maximumElementOpt(s) {
        return s.tag === 1 ? s.a : s.tag === 0 ? null : tree_maximumElementAux(s.c, s.a);
    }
    function tree_minimumElement(s) {
        var matchValue = tree_minimumElementOpt(s);
        if (matchValue == null) {
            throw new Error("Set contains no elements");
        }
        else {
            return matchValue;
        }
    }
    function tree_maximumElement(s) {
        var matchValue = tree_maximumElementOpt(s);
        if (matchValue == null) {
            throw new Error("Set contains no elements");
        }
        else {
            return matchValue;
        }
    }
    function tree_collapseLHS(stack) {
        collapseLHS: while (true) {
            if (stack.tail != null) {
                if (stack.head.tag === 1) {
                    return stack;
                }
                else if (stack.head.tag === 2) {
                    stack = List_2.ofArray([stack.head.b, tree_SetOne(stack.head.a), stack.head.c], stack.tail);
                    continue collapseLHS;
                }
                else {
                    stack = stack.tail;
                    continue collapseLHS;
                }
            }
            else {
                return new List_1.default();
            }
        }
    }
    function tree_mkIterator(s) {
        return { stack: tree_collapseLHS(new List_1.default(s, new List_1.default())), started: false };
    }
    ;
    function tree_moveNext(i) {
        function current(i) {
            if (i.stack.tail == null) {
                return null;
            }
            else if (i.stack.head.tag === 1) {
                return i.stack.head.a;
            }
            throw new Error("Please report error: Set iterator, unexpected stack for current");
        }
        if (i.started) {
            if (i.stack.tail == null) {
                return { done: true, value: null };
            }
            else {
                if (i.stack.head.tag === 1) {
                    i.stack = tree_collapseLHS(i.stack.tail);
                    return {
                        done: i.stack.tail == null,
                        value: current(i)
                    };
                }
                else {
                    throw new Error("Please report error: Set iterator, unexpected stack for moveNext");
                }
            }
        }
        else {
            i.started = true;
            return {
                done: i.stack.tail == null,
                value: current(i)
            };
        }
        ;
    }
    function tree_compareStacks(comparer, l1, l2) {
        compareStacks: while (true) {
            var matchValue = l1.tail != null ? l2.tail != null ? l2.head.tag === 1 ? l1.head.tag === 1 ? [4, l1.head.a, l2.head.a, l1.tail, l2.tail] : l1.head.tag === 2 ? l1.head.b.tag === 0 ? [6, l1.head.b, l1.head.a, l1.head.c, l2.head.a, l1.tail, l2.tail] : [9, l1.head.a, l1.head.b, l1.head.c, l1.tail] : [10, l2.head.a, l2.tail] : l2.head.tag === 2 ? l2.head.b.tag === 0 ? l1.head.tag === 1 ? [5, l1.head.a, l2.head.a, l2.head.c, l1.tail, l2.tail] : l1.head.tag === 2 ? l1.head.b.tag === 0 ? [7, l1.head.a, l1.head.c, l2.head.a, l2.head.c, l1.tail, l2.tail] : [9, l1.head.a, l1.head.b, l1.head.c, l1.tail] : [11, l2.head.a, l2.head.b, l2.head.c, l2.tail] : l1.head.tag === 1 ? [8, l1.head.a, l1.tail] : l1.head.tag === 2 ? [9, l1.head.a, l1.head.b, l1.head.c, l1.tail] : [11, l2.head.a, l2.head.b, l2.head.c, l2.tail] : l1.head.tag === 1 ? [8, l1.head.a, l1.tail] : l1.head.tag === 2 ? [9, l1.head.a, l1.head.b, l1.head.c, l1.tail] : [3, l1.tail, l2.tail] : [2] : l2.tail != null ? [1] : [0];
            switch (matchValue[0]) {
                case 0:
                    return 0;
                case 1:
                    return -1;
                case 2:
                    return 1;
                case 3:
                    comparer = comparer;
                    l1 = matchValue[1];
                    l2 = matchValue[2];
                    continue compareStacks;
                case 4:
                    var c = comparer.Compare(matchValue[1], matchValue[2]) | 0;
                    if (c !== 0) {
                        return c | 0;
                    }
                    else {
                        comparer = comparer;
                        l1 = matchValue[3];
                        l2 = matchValue[4];
                        continue compareStacks;
                    }
                case 5:
                    var c_1 = comparer.Compare(matchValue[1], matchValue[2]) | 0;
                    if (c_1 !== 0) {
                        return c_1 | 0;
                    }
                    else {
                        comparer = comparer;
                        l1 = new List_1.default(new SetTree(0), matchValue[4]);
                        l2 = new List_1.default(matchValue[3], matchValue[5]);
                        continue compareStacks;
                    }
                case 6:
                    var c_2 = comparer.Compare(matchValue[2], matchValue[4]) | 0;
                    if (c_2 !== 0) {
                        return c_2 | 0;
                    }
                    else {
                        comparer = comparer;
                        l1 = new List_1.default(matchValue[3], matchValue[5]);
                        l2 = new List_1.default(matchValue[1], matchValue[6]);
                        continue compareStacks;
                    }
                case 7:
                    var c_3 = comparer.Compare(matchValue[1], matchValue[3]) | 0;
                    if (c_3 !== 0) {
                        return c_3 | 0;
                    }
                    else {
                        comparer = comparer;
                        l1 = new List_1.default(matchValue[2], matchValue[5]);
                        l2 = new List_1.default(matchValue[4], matchValue[6]);
                        continue compareStacks;
                    }
                case 8:
                    comparer = comparer;
                    l1 = List_2.ofArray([new SetTree(0), tree_SetOne(matchValue[1])], matchValue[2]);
                    l2 = l2;
                    continue compareStacks;
                case 9:
                    comparer = comparer;
                    l1 = List_2.ofArray([matchValue[2], tree_SetNode(matchValue[1], new SetTree(0), matchValue[3], 0)], matchValue[4]);
                    l2 = l2;
                    continue compareStacks;
                case 10:
                    comparer = comparer;
                    l1 = l1;
                    l2 = List_2.ofArray([new SetTree(0), tree_SetOne(matchValue[1])], matchValue[2]);
                    continue compareStacks;
                case 11:
                    comparer = comparer;
                    l1 = l1;
                    l2 = List_2.ofArray([matchValue[2], tree_SetNode(matchValue[1], new SetTree(0), matchValue[3], 0)], matchValue[4]);
                    continue compareStacks;
            }
        }
    }
    function tree_compare(comparer, s1, s2) {
        if (s1.tag === 0) {
            return s2.tag === 0 ? 0 : -1;
        }
        else {
            return s2.tag === 0 ? 1 : tree_compareStacks(comparer, List_2.ofArray([s1]), List_2.ofArray([s2]));
        }
    }
    function tree_mkFromEnumerator(comparer, acc, e) {
        var cur = e.next();
        while (!cur.done) {
            acc = tree_add(comparer, cur.value, acc);
            cur = e.next();
        }
        return acc;
    }
    function tree_ofSeq(comparer, c) {
        var ie = c[Symbol.iterator]();
        return tree_mkFromEnumerator(comparer, new SetTree(0), ie);
    }
    var FableSet = (function () {
        function FableSet() {
        }
        FableSet.prototype.ToString = function () {
            return "set [" + Array.from(this).map(Util_1.toString).join("; ") + "]";
        };
        FableSet.prototype.Equals = function (s2) {
            return this.CompareTo(s2) === 0;
        };
        FableSet.prototype.CompareTo = function (s2) {
            return this === s2 ? 0 : tree_compare(this.comparer, this.tree, s2.tree);
        };
        FableSet.prototype[Symbol.iterator] = function () {
            var i = tree_mkIterator(this.tree);
            return {
                next: function () { return tree_moveNext(i); }
            };
        };
        FableSet.prototype.values = function () {
            return this[Symbol.iterator]();
        };
        FableSet.prototype.has = function (v) {
            return tree_mem(this.comparer, v, this.tree);
        };
        FableSet.prototype.add = function (v) {
            this.tree = tree_add(this.comparer, v, this.tree);
            return this;
        };
        FableSet.prototype.delete = function (v) {
            var oldSize = tree_count(this.tree);
            this.tree = tree_remove(this.comparer, v, this.tree);
            return oldSize > tree_count(this.tree);
        };
        FableSet.prototype.clear = function () {
            this.tree = new SetTree(0);
        };
        Object.defineProperty(FableSet.prototype, "size", {
            get: function () {
                return tree_count(this.tree);
            },
            enumerable: true,
            configurable: true
        });
        FableSet.prototype[Symbol_1.default.reflection] = function () {
            return {
                type: "Microsoft.FSharp.Collections.FSharpSet",
                interfaces: ["System.IEquatable", "System.IComparable"]
            };
        };
        return FableSet;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FableSet;
    function from(comparer, tree) {
        var s = new FableSet();
        s.tree = tree;
        s.comparer = comparer || new GenericComparer_1.default();
        return s;
    }
    function create(ie, comparer) {
        comparer = comparer || new GenericComparer_1.default();
        return from(comparer, ie ? tree_ofSeq(comparer, ie) : new SetTree(0));
    }
    exports.create = create;
    function isEmpty(s) {
        return tree_isEmpty(s.tree);
    }
    exports.isEmpty = isEmpty;
    function add(item, s) {
        return from(s.comparer, tree_add(s.comparer, item, s.tree));
    }
    exports.add = add;
    function addInPlace(item, s) {
        return s.has(item) ? false : (s.add(item), true);
    }
    exports.addInPlace = addInPlace;
    function remove(item, s) {
        return from(s.comparer, tree_remove(s.comparer, item, s.tree));
    }
    exports.remove = remove;
    function union(set1, set2) {
        return set2.tree.tag === 0
            ? set1
            : set1.tree.tag === 0
                ? set2
                : from(set1.comparer, tree_union(set1.comparer, set1.tree, set2.tree));
    }
    exports.union = union;
    function op_Addition(set1, set2) {
        return union(set1, set2);
    }
    exports.op_Addition = op_Addition;
    function unionInPlace(set1, set2) {
        Seq_1.iterate(function (x) { set1.add(x); }, set2);
    }
    exports.unionInPlace = unionInPlace;
    function unionMany(sets) {
        return Seq_2.fold(function (acc, s) { return union(s, acc); }, create(), sets);
    }
    exports.unionMany = unionMany;
    function difference(set1, set2) {
        return set1.tree.tag === 0
            ? set1
            : set2.tree.tag === 0
                ? set1
                : from(set1.comparer, tree_diff(set1.comparer, set1.tree, set2.tree));
    }
    exports.difference = difference;
    function op_Subtraction(set1, set2) {
        return difference(set1, set2);
    }
    exports.op_Subtraction = op_Subtraction;
    function differenceInPlace(set1, set2) {
        Seq_1.iterate(function (x) { set1.delete(x); }, set2);
    }
    exports.differenceInPlace = differenceInPlace;
    function intersect(set1, set2) {
        return set2.tree.tag === 0
            ? set2
            : set1.tree.tag === 0
                ? set1
                : from(set1.comparer, tree_intersection(set1.comparer, set1.tree, set2.tree));
    }
    exports.intersect = intersect;
    function intersectInPlace(set1, set2) {
        var set2_ = set2 instanceof Set ? set2 : new Set(set2);
        Seq_1.iterate(function (x) { if (!set2_.has(x)) {
            set1.delete(x);
        } }, set1);
    }
    exports.intersectInPlace = intersectInPlace;
    function intersectMany(sets) {
        return Seq_3.reduce(function (s1, s2) { return intersect(s1, s2); }, sets);
    }
    exports.intersectMany = intersectMany;
    function isProperSubsetOf(set1, set2) {
        if (set1 instanceof FableSet && set2 instanceof FableSet) {
            return tree_psubset(set1.comparer, set1.tree, set2.tree);
        }
        else {
            set2 = set2 instanceof Set ? set2 : new Set(set2);
            return Seq_4.forAll(function (x) { return set2.has(x); }, set1) && Seq_5.exists(function (x) { return !set1.has(x); }, set2);
        }
    }
    exports.isProperSubsetOf = isProperSubsetOf;
    function isProperSubset(set1, set2) {
        return isProperSubsetOf(set1, set2);
    }
    exports.isProperSubset = isProperSubset;
    function isSubsetOf(set1, set2) {
        if (set1 instanceof FableSet && set2 instanceof FableSet) {
            return tree_subset(set1.comparer, set1.tree, set2.tree);
        }
        else {
            set2 = set2 instanceof Set ? set2 : new Set(set2);
            return Seq_4.forAll(function (x) { return set2.has(x); }, set1);
        }
    }
    exports.isSubsetOf = isSubsetOf;
    function isSubset(set1, set2) {
        return isSubsetOf(set1, set2);
    }
    exports.isSubset = isSubset;
    function isProperSupersetOf(set1, set2) {
        if (set1 instanceof FableSet && set2 instanceof FableSet) {
            return tree_psubset(set1.comparer, set2.tree, set1.tree);
        }
        else {
            return isProperSubset(set2 instanceof Set ? set2 : new Set(set2), set1);
        }
    }
    exports.isProperSupersetOf = isProperSupersetOf;
    function isProperSuperset(set1, set2) {
        return isProperSupersetOf(set1, set2);
    }
    exports.isProperSuperset = isProperSuperset;
    function isSupersetOf(set1, set2) {
        if (set1 instanceof FableSet && set2 instanceof FableSet) {
            return tree_subset(set1.comparer, set2.tree, set1.tree);
        }
        else {
            return isSubset(set2 instanceof Set ? set2 : new Set(set2), set1);
        }
    }
    exports.isSupersetOf = isSupersetOf;
    function isSuperset(set1, set2) {
        return isSupersetOf(set1, set2);
    }
    exports.isSuperset = isSuperset;
    function copyTo(xs, arr, arrayIndex, count) {
        if (!Array.isArray(arr) && !ArrayBuffer.isView(arr))
            throw new Error("Array is invalid");
        count = count || arr.length;
        var i = arrayIndex || 0;
        var iter = xs[Symbol.iterator]();
        while (count--) {
            var el = iter.next();
            if (el.done)
                break;
            arr[i++] = el.value;
        }
    }
    exports.copyTo = copyTo;
    function partition(f, s) {
        if (s.tree.tag === 0) {
            return [s, s];
        }
        else {
            var tuple = tree_partition(s.comparer, f, s.tree);
            return [from(s.comparer, tuple[0]), from(s.comparer, tuple[1])];
        }
    }
    exports.partition = partition;
    function filter(f, s) {
        if (s.tree.tag === 0) {
            return s;
        }
        else {
            return from(s.comparer, tree_filter(s.comparer, f, s.tree));
        }
    }
    exports.filter = filter;
    function map(f, s) {
        var comparer = new GenericComparer_1.default();
        return from(comparer, tree_fold(function (acc, k) { return tree_add(comparer, f(k), acc); }, new SetTree(0), s.tree));
    }
    exports.map = map;
    function exists(f, s) {
        return tree_exists(f, s.tree);
    }
    exports.exists = exists;
    function forAll(f, s) {
        return tree_forall(f, s.tree);
    }
    exports.forAll = forAll;
    function fold(f, seed, s) {
        return tree_fold(f, seed, s.tree);
    }
    exports.fold = fold;
    function foldBack(f, s, seed) {
        return tree_foldBack(f, s.tree, seed);
    }
    exports.foldBack = foldBack;
    function iterate(f, s) {
        tree_iter(f, s.tree);
    }
    exports.iterate = iterate;
    function minimumElement(s) {
        return tree_minimumElement(s.tree);
    }
    exports.minimumElement = minimumElement;
    function minElement(s) {
        return tree_minimumElement(s.tree);
    }
    exports.minElement = minElement;
    function maximumElement(s) {
        return tree_maximumElement(s.tree);
    }
    exports.maximumElement = maximumElement;
    function maxElement(s) {
        return tree_maximumElement(s.tree);
    }
    exports.maxElement = maxElement;
});
