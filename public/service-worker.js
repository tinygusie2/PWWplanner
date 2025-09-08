self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || 'Herinnering van PWW Planner';
    const body = `${data.type} voor ${data.vak}: ${data.title}`;

    const options = {
        body: body,
        icon: '/ico.svg', 
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/planner.html'));
});