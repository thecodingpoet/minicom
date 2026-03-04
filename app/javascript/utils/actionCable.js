import { createConsumer } from "@rails/actioncable";

function getCableUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/cable`;
}

export function createTicketSubscription(ticketId, onUpdate) {
  const token = localStorage.getItem("token");
  const url = token ? `${getCableUrl()}?token=${encodeURIComponent(token)}` : getCableUrl();
  const cable = createConsumer(url);

  const subscription = cable.subscriptions.create(
    { channel: "TicketChannel", id: ticketId },
    {
      received(data) {
        if (data.type === "update") {
          onUpdate(data);
        }
      },
    }
  );

  return () => {
    subscription.unsubscribe();
    cable.disconnect();
  };
}

export function createNotificationSubscription(onNotification) {
  const token = localStorage.getItem("token");
  const url = token ? `${getCableUrl()}?token=${encodeURIComponent(token)}` : getCableUrl();
  const cable = createConsumer(url);

  const subscription = cable.subscriptions.create(
    { channel: "NotificationChannel" },
    {
      received(data) {
        onNotification(data);
      },
    }
  );

  return () => {
    subscription.unsubscribe();
    cable.disconnect();
  };
}

export function createInboxSubscription(onUpdate) {
  const token = localStorage.getItem("token");
  const url = token ? `${getCableUrl()}?token=${encodeURIComponent(token)}` : getCableUrl();
  const cable = createConsumer(url);

  const subscription = cable.subscriptions.create(
    { channel: "InboxChannel" },
    {
      received(data) {
        if (data.type === "new_ticket" || data.type === "ticket_updated") {
          onUpdate();
        }
      },
    }
  );

  return () => {
    subscription.unsubscribe();
    cable.disconnect();
  };
}
