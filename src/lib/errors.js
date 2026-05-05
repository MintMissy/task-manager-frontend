/** Safe message for UI when catching unknown throwables. */
export function getErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
