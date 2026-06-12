# Route Status Expiry Fix - Implementation Summary

## Problem
Routes remained `ACTIVE` after their departure/arrival time had passed, preventing automatic status transitions and causing old routes to be matched with parcels.

## Root Causes Identified
1. **Redis Cache Status Casing Mismatch**: Database stores routes with uppercase `"ACTIVE"` status, but cache code only checked for lowercase `"active"` when adding to active routes set.
2. **Route Expiry Job Disabled**: The `expireRequestsWithExpiredRoutes()` function was intentionally disabled, preventing automatic cleanup of expired routes.
3. **Missing Route Expiry Detection**: No utility functions existed to detect when a route had passed its departure/arrival time.

## Fixes Applied

### 1. Route Service Helpers (`travellerRoute.service.js`)
Added three new helper functions to detect and auto-complete expired routes:

```javascript
function buildIsoDateTime(date, time) {
  // Converts DB date/time to ISO DateTime for comparison
  // Handles both 'HH:MM' and 'HH:MM:SS' formats
}

function isRouteExpired(route) {
  // Checks if route has passed its arrival_time or departure_time
  // Ignores recurring routes and non-ACTIVE routes
  // Returns true if route is expired
}

async function refreshRouteStatus(route) {
  // Automatically marks expired ACTIVE routes as COMPLETED
  // Called on getTravellerRoutes, getRouteById, and searchTravellerRoutes
  // Invalidates cache after status update
}
```

**Where it's used:**
- `getTravellerRoutes()` - refreshes all routes for a traveller
- `getRouteById()` - refreshes single route before returning
- `searchTravellerRoutes()` - refreshes all search results before filtering

### 2. Redis Cache Status Normalization (`travellerRouteCache.service.js`)
Fixed the `cacheRoute()` function to handle uppercase status:

**Before:**
```javascript
if (routeData.status === "active") {  // ❌ Checks lowercase only
```

**After:**
```javascript
if ((routeData.status || "").toString().toUpperCase() === "ACTIVE") {  // ✅ Normalized
```

Also updated the database query to match uppercase:
```sql
WHERE tr.status = 'ACTIVE'  -- ✅ Was 'active'
```

### 3. Auto-Cancel Job Re-enabled (`autoCancel.job.js`)
Restored the `expireRequestsWithExpiredRoutes()` function to automatically mark expired routes:

**Implementation:**
- Fetches all non-recurring ACTIVE routes from database
- Filters using `isRouteExpired()` helper
- Updates matching routes to COMPLETED status
- Invalidates route cache for each updated route
- Logs the count of completed routes

**Schedule:**
- Runs every 5 minutes (configurable via `AUTO_CANCEL_INTERVAL_MS`)
- Executed in separate process with Redis lock for distributed safety
- Graceful error handling

## How It Works

### Route Expiry Detection Flow
1. **On Route Retrieval** (real-time):
   - When a traveller views their routes, each route is checked
   - If expired, status is updated to COMPLETED immediately
   - Cache is invalidated for that route

2. **On Auto-Cancel Job** (scheduled, every 5 min):
   - All ACTIVE non-recurring routes are queried
   - Each route's departure/arrival time is checked
   - Expired routes are marked COMPLETED
   - Cache is invalidated for efficiency

3. **On Matching** (pre-filtering):
   - Matching engine queries for ACTIVE routes
   - Routes with future times are included
   - Expired routes (status=COMPLETED) are excluded

## Testing Recommendations

1. **Manual Test**: Create a one-time route with departure time 10 minutes ago
   - Expected: Route should appear as COMPLETED when retrieved
   - Verify via: GET `/traveller/routes` endpoint

2. **Scheduled Test**: Monitor logs for auto-cancel job
   - Expected: Every 5 minutes, log shows expired routes marked COMPLETED
   - Check: `[AutoCancel] Marked X expired route(s) as COMPLETED`

3. **Matching Test**: Verify old routes don't get matched
   - Create route with past time
   - Create parcel
   - Expected: Route should NOT appear in matching candidates

4. **Cache Consistency**: Verify Redis cache reflects DB status
   - Create route → verify it's in active routes set
   - Wait for expiry → verify it's removed from active routes set
   - Check: Redis keys `routes:active` and `route:{id}`

## Files Modified
1. `src/modules/traveller/travellerRoute.service.js` - Added expiry helper functions
2. `src/redis/cache/travellerRouteCache.service.js` - Fixed status case normalization
3. `src/jobs/autoCancel.job.js` - Re-enabled route expiry logic

## Backwards Compatibility
✅ All changes are backwards compatible:
- Case normalization is defensive (works with any case)
- Route retrieval always refreshes status (transparent to callers)
- Auto-cancel job only affects old ACTIVE routes (non-breaking change)
