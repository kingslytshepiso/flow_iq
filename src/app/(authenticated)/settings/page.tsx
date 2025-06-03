"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useState } from "react";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  lowStockAlerts: boolean;
  salesAlerts: boolean;
  expenseAlerts: boolean;
}

interface DisplaySettings {
  language: string;
  theme: "light" | "dark";
  currency: string;
  dateFormat: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    salesAlerts: true,
    expenseAlerts: true,
  });
  const [display, setDisplay] = useState<DisplaySettings>({
    language: language,
    theme: "light",
    currency: "ZAR",
    dateFormat: "DD/MM/YYYY",
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDisplayChange = (key: keyof DisplaySettings, value: string) => {
    setDisplay((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "language") {
      setLanguage(value as "en" | "zu");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {t("settings.title")}
        </h1>
        <p className="text-[var(--text)]/70">{t("settings.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "general"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-[var(--text)]/70 hover:text-[var(--text)]"
            }`}
          >
            {t("settings.general.title")}
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-[var(--text)]/70 hover:text-[var(--text)]"
            }`}
          >
            {t("settings.notifications.title")}
          </button>
          <button
            onClick={() => setActiveTab("display")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "display"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-[var(--text)]/70 hover:text-[var(--text)]"
            }`}
          >
            {t("settings.display.title")}
          </button>
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">
              {t("settings.general.accountInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("settings.general.email")}
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("settings.general.name")}
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">
              {t("settings.notifications.preferences")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {t("settings.notifications.emailNotifications")}
                  </h3>
                  <p className="text-sm text-[var(--text)]/70">
                    {t("settings.notifications.emailNotificationsDesc")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() =>
                      handleNotificationChange("emailNotifications")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {t("settings.notifications.pushNotifications")}
                  </h3>
                  <p className="text-sm text-[var(--text)]/70">
                    {t("settings.notifications.pushNotificationsDesc")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pushNotifications}
                    onChange={() =>
                      handleNotificationChange("pushNotifications")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {t("settings.notifications.lowStockAlerts")}
                  </h3>
                  <p className="text-sm text-[var(--text)]/70">
                    {t("settings.notifications.lowStockAlertsDesc")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.lowStockAlerts}
                    onChange={() => handleNotificationChange("lowStockAlerts")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display Settings */}
      {activeTab === "display" && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">
              {t("settings.display.preferences")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("settings.display.language")}
                </label>
                <select
                  value={display.language}
                  onChange={(e) =>
                    handleDisplayChange("language", e.target.value)
                  }
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="zu">Zulu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("settings.display.theme")}
                </label>
                <select
                  value={display.theme}
                  onChange={(e) => handleDisplayChange("theme", e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                >
                  <option value="light">{t("settings.display.light")}</option>
                  <option value="dark">{t("settings.display.dark")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("settings.display.currency")}
                </label>
                <select
                  value={display.currency}
                  onChange={(e) =>
                    handleDisplayChange("currency", e.target.value)
                  }
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                >
                  <option value="ZAR">South African Rand (ZAR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("settings.display.dateFormat")}
                </label>
                <select
                  value={display.dateFormat}
                  onChange={(e) =>
                    handleDisplayChange("dateFormat", e.target.value)
                  }
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
