import * as Location from "expo-location";
import { ResultAsync } from "neverthrow";
import {
	type Coordinate,
	LocationError,
	type LocationPermissionStatus,
} from "./types";

function toLocationPermissionStatus(
	status: Location.PermissionStatus,
): LocationPermissionStatus {
	switch (status) {
		case Location.PermissionStatus.GRANTED:
			return "granted";
		case Location.PermissionStatus.DENIED:
			return "denied";
		case Location.PermissionStatus.UNDETERMINED:
			return "undetermined";
		default: {
			const _exhaustiveCheck: never = status;
			return _exhaustiveCheck;
		}
	}
}

export function getForegroundPermissionStatus(): ResultAsync<
	LocationPermissionStatus,
	LocationError
> {
	return ResultAsync.fromPromise(
		Location.getForegroundPermissionsAsync(),
		(e) => new LocationError("パーミッション取得に失敗しました", { cause: e }),
	).map(({ status }) => toLocationPermissionStatus(status));
}

export function requestForegroundPermission(): ResultAsync<
	LocationPermissionStatus,
	LocationError
> {
	return ResultAsync.fromPromise(
		Location.requestForegroundPermissionsAsync(),
		(e) => new LocationError("パーミッション要求に失敗しました", { cause: e }),
	).map(({ status }) => toLocationPermissionStatus(status));
}

export function getCurrentLocation(): ResultAsync<Coordinate, LocationError> {
	return ResultAsync.fromPromise(
		Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.Balanced,
		}),
		(e) => new LocationError("現在地の取得に失敗しました", { cause: e }),
	).map(({ coords }) => ({
		latitude: coords.latitude,
		longitude: coords.longitude,
	}));
}
