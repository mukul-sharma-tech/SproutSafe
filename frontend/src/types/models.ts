export interface Parent {
  _id: string;
  name: string;
  email: string;
  children: string[];
  telegramChatId?: string;
}

export interface MonitoredUrl {
  _id: string;
  url?: string;
  domain: string;
  category: string;
  dailyTimeSpent: Record<string, number>;
  searchQueries: string[];
  lastUpdated: string;
}

export interface IncognitoAlert {
  _id?: string;
  url: string;
  timestamp: string;
}

export interface Child {
  _id: string;
  name: string;
  email: string;
  extensionToken?: string;
  token?: string;
  location?: string;
  blockedUrls: string[];
  monitoredUrls: MonitoredUrl[];
  incognitoAlerts: IncognitoAlert[];
  lastHeartbeat: string;
  status: "online" | "offline";
  lockoutUntil?: string | null;
  failedAttempts: number;
}

export interface LogEntry {
  _id: string;
  child: string;
  type: string;
  domain?: string;
  timestamp: string;
  message: string;
}

export interface ActivityItem {
  content: string;
  type: string;
  timestamp: string;
}

export interface WebUsageStats {
  totalTime: string;
}

export interface WebUsageStatsFull {
  usageDetails: MonitoredUrl[];
  totalTime: string;
}

export interface BlockedStats {
  count: number;
}

export interface BlockedStatsFull {
  blockedList: { domain: string }[];
}

export interface AlertsResponse {
  alerts: IncognitoAlert[];
}

export interface ActivitiesResponse {
  activities: ActivityItem[];
}

export interface CategoryCount {
  category: string;
  count: number;
}
