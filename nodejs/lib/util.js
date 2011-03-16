var Util = exports || {};

Util.mergeDeep = function (A, B, depth) {
	var forever = depth == null;
	for (var p in B) {
		if (B[p] != null && B[p].constructor==Object && (forever || depth > 0)) {
			A[p] = Util.mergeDeep(
				A.hasOwnProperty(p) ? A[p] : {},
				B[p],
				forever ? null : depth-1
			);
		} else {
			A[p] = B[p];
		}
	}
	return A;
}

Util.merge = function(A, B) {
	return Util.mergeDeep(A, B, 0);
}

Util.mergeCopy = function(A, B, depth) {
	var A_copy = Util.mergeDeep({}, A);
	return Util.mergeDeep(A_copy, B, depth);
}
