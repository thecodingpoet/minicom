import { driver } from "driver.js";

const STORAGE_KEY = "agentTourCompleted";
const GOTO_SETTINGS_KEY = "agentTourGotoSettings";

export function hasCompletedAgentTour() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function markAgentTourCompleted() {
  localStorage.setItem(STORAGE_KEY, "true");
}

export function clearAgentTourCompleted() {
  localStorage.removeItem(STORAGE_KEY);
}

export function shouldRunSettingsTour() {
  return sessionStorage.getItem(GOTO_SETTINGS_KEY) === "1";
}

export function clearSettingsTourFlag() {
  sessionStorage.removeItem(GOTO_SETTINGS_KEY);
}

export function runAgentInboxTour(onNavigateToSettings) {
  const driverObj = driver({
    showProgress: true,
    popoverClass: "driver-popover-minicom",
    stagePadding: 8,
    stageRadius: 12,
    overlayOpacity: 0.6,
    steps: [
      {
        element: "[data-tour='inbox-header']",
        popover: {
          title: "Welcome to Minicom",
          description: "Your support inbox. Here's a quick tour of the key features.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='assignment-dropdown']",
        popover: {
          title: "Filter by assignment",
          description: "Switch between Everyone's tickets, only Mine, or Unassigned tickets.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='status-filters']",
        popover: {
          title: "Filter by status",
          description: "View Open, In Progress, or Closed tickets.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='ticket-list']",
        popover: {
          title: "Ticket list",
          description: "Click any ticket to view details and reply to customers.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "[data-tour='notification-bell']",
        popover: {
          title: "Notifications",
          description: "Get notified when customers reply or tickets are closed.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "[data-tour='user-menu']",
        popover: {
          title: "Profile & Settings",
          description: "Open your profile to access Settings. Click Done and we'll show you where to export closed tickets as CSV.",
          side: "bottom",
          align: "end",
          onNextClick: () => {
            sessionStorage.setItem(GOTO_SETTINGS_KEY, "1");
            driverObj.destroy();
            onNavigateToSettings();
          },
        },
      },
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
      markAgentTourCompleted();
    },
    onDestroyed: () => {
      markAgentTourCompleted();
    },
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Done",
  });

  driverObj.drive();
}

export function runAgentSettingsTour() {
  clearSettingsTourFlag();

  const driverObj = driver({
    showProgress: false,
    popoverClass: "driver-popover-minicom",
    stagePadding: 8,
    stageRadius: 12,
    overlayOpacity: 0.6,
    steps: [
      {
        element: "[data-tour='csv-export']",
        popover: {
          title: "Export closed tickets as CSV",
          description:
            "Click 'Download CSV' to export all tickets closed in the last 30 days. The file includes ticket ID, subject, customer email, status, and timestamps.",
          side: "top",
          align: "start",
        },
      },
    ],
    onDestroyed: () => {
      markAgentTourCompleted();
    },
    doneBtnText: "Got it",
  });

  driverObj.drive();
}
