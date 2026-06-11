export function parseArrivalDateTime(route) {
	if (!route || !route.arrival_date) return null;

	let arrivalDate;
	if (route.arrival_date instanceof Date) {
		arrivalDate = new Date(route.arrival_date);
	} else if (typeof route.arrival_date === "string") {
		const [year, month, day] = route.arrival_date.split("-").map(Number);
		if ([year, month, day].some((value) => Number.isNaN(value))) {
			return null;
		}
		arrivalDate = new Date(year, month - 1, day);
	} else {
		return null;
	}

	if (route.arrival_time) {
		const timeParts = route.arrival_time.split(":").map(Number);
		if (timeParts.length >= 2 && !Number.isNaN(timeParts[0]) && !Number.isNaN(timeParts[1])) {
			arrivalDate.setHours(timeParts[0], timeParts[1], Number.isNaN(timeParts[2]) ? 0 : timeParts[2], 0);
		}
	} else {
		arrivalDate.setHours(23, 59, 59, 999);
	}

	return arrivalDate;
}

export function isRouteExpired(route) {
	const arrivalDateTime = parseArrivalDateTime(route);
	if (!arrivalDateTime) return false;
	return arrivalDateTime.getTime() < Date.now();
}