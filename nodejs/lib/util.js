util = exports;

util.mergeDeep = function (A, B, depth) {
	var forever = depth == null;
	for (var p in B) {
		if (B[p] != null && B[p].constructor==Object && (forever || depth > 0)) {
			A[p] = util.mergeDeep(
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

util.merge = function(A, B) {
	return util.mergeDeep(A, B, 0);
}

util.mergeCopy = function(A, B, depth) {
	var A_copy = util.mergeDeep({}, A);
	return util.mergeDeep(A_copy, B, depth);
}
