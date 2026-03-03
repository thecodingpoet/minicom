import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS_COUNT, GET_TICKET } from "../graphql/queries";
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from "../graphql/mutations";
import { createNotificationSubscription } from "../utils/actionCable";
import { useAuth } from "../utils/auth";
import { isAgent } from "../constants/roles";

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function actionText(notification) {
  const { action, actor, ticketSubject } = notification;
  const name = actor?.fullName || "Someone";
  const subject = ticketSubject || "a ticket";

  switch (action) {
    case "new_comment":
      return { name, verb: "commented on", subject };
    case "ticket_closed":
      return { name, verb: "closed", subject };
    default:
      return { name, verb: "updated", subject };
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const client = useApolloClient();
  const { user } = useAuth();

  const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
    fetchPolicy: "network-only",
  });

  const { data: listData, refetch: refetchList } = useQuery(GET_NOTIFICATIONS, {
    skip: !open,
    fetchPolicy: "network-only",
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

  const locationRef = useRef(location.pathname);
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  const handleNewNotification = useCallback((data) => {
    const ticketPath = `/tickets/${data.ticket_id}`;
    const agentTicketPath = `/agent/tickets/${data.ticket_id}`;
    const onTicketPage = locationRef.current === ticketPath || locationRef.current === agentTicketPath;

    if (onTicketPage) {
      markAsRead({ variables: { notificationId: String(data.id) } }).then(() => {
        refetchCount();
        if (open) refetchList();
      });
    } else {
      refetchCount();
      if (open) refetchList();
    }
  }, [open, refetchCount, refetchList, markAsRead]);

  useEffect(() => {
    return createNotificationSubscription(handleNewNotification);
  }, [handleNewNotification]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = countData?.unreadNotificationsCount || 0;
  const notifications = listData?.notifications || [];

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      refetchList();
      refetchCount();
    }
  };

  const handleClick = async (notification) => {
    if (!notification.readAt) {
      await markAsRead({
        variables: { notificationId: notification.id },
      });
      refetchCount();
      refetchList();
    }
    setOpen(false);
    if (notification.ticketId) {
      const isAgentUser = isAgent(user);
      const ticketPath = isAgentUser
        ? `/agent/tickets/${notification.ticketId}`
        : `/tickets/${notification.ticketId}`;
      if (location.pathname === ticketPath) {
        client.refetchQueries({ include: [GET_TICKET] });
      } else {
        navigate(ticketPath);
      }
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetchCount();
    refetchList();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-accent hover:text-accent/80 cursor-pointer border-none bg-transparent font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const { name, verb, subject } = actionText(n);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-none border-b border-gray-50 ${
                      n.readAt ? "bg-white" : "bg-blue-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.readAt && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                      <div className={`flex-1 ${n.readAt ? "pl-4" : ""}`}>
                        <p className="text-[13px] text-gray-700 leading-snug">
                          <span className="font-medium text-gray-900">{name}</span>{" "}
                          {verb}{" "}
                          <span className="font-medium text-gray-900">{subject}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
