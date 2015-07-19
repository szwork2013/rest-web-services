/**
 * Get the error message from error mongoose
 */
exports.getErrorMessage = function(err) {
	var message = '';
	for (var errName in err.errors) {
		if (err.errors[errName].message) message = err.errors[errName].message;
	}

	return message;
};