const CACHE_NAME = "agriculture-assistant-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  // Add other critical assets here
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline response for chat API
            if (url.pathname === "/api/chat") {
              return new Response(
                JSON.stringify({
                  response:
                    "I'm currently offline. Here's some general agriculture advice: Practice crop rotation, maintain soil health with organic matter, and monitor weather conditions regularly for optimal farming results.",
                  offline: true,
                }),
                {
                  headers: { "Content-Type": "application/json" },
                },
              )
            }
            throw new Error("No cached response available")
          })
        }),
    )
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response.ok) {
            return response
          }

          // Cache the response
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return (
              caches.match("/offline") ||
              new Response("Offline - Please check your internet connection", {
                headers: { "Content-Type": "text/html" },
              })
            )
          }
          throw new Error("Network request failed and no cache available")
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "chat-sync") {
    event.waitUntil(
      // Handle offline chat messages when back online
      syncOfflineMessages(),
    )
  }
})

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "New agriculture update available",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/",
    },
  }

  event.waitUntil(self.registration.showNotification("Agriculture Assistant", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked")
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"))
})

// Helper function to sync offline messages
async function syncOfflineMessages() {
  try {
    // Get offline messages from IndexedDB or localStorage
    const offlineMessages = await getOfflineMessages()

    for (const message of offlineMessages) {
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        })

        // Remove from offline storage after successful sync
        await removeOfflineMessage(message.id)
      } catch (error) {
        console.error("[SW] Failed to sync message:", error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}

// Placeholder functions for offline message management
async function getOfflineMessages() {
  // Implementation would use IndexedDB or localStorage
  return []
}

async function removeOfflineMessage(messageId) {
  // Implementation would remove from IndexedDB or localStorage
  console.log("[SW] Removing offline message:", messageId)
}
