import { getCalendarView, listEmails, callOutlookOperation } from './connectors/office365outlook.js';
import { GetChats, HttpRequest } from './connectors/teams.js';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
let refreshCountdown = REFRESH_INTERVAL;
let refreshTimerInterval = null;
let meetingsData = [];
let emailSenders = [];
let teamsWeekChats = [];
let teamsTodayChats = [];

// ── Utilities ──────────────────────────────────────────────────
function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMon);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { start: monday, end: friday };
}

function formatWeekRange(start, end) {
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)} ${end.getFullYear()}`;
}

function formatHours(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getDayLabel(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── Data fetching ──────────────────────────────────────────────
async function fetchCalendar() {
  const { start, end } = getWeekBounds();
  try {
    const result = await getCalendarView({
      startDateTimeUtc: start.toISOString(),
      endDateTimeUtc: end.toISOString(),
      top: 200
    });
    const events = result?.value || result || [];
    return Array.isArray(events) ? events : [];
  } catch (e) {
    console.error('Calendar fetch error:', e);
    return [];
  }
}

async function fetchEmails(folderId, top = 50) {
  const { start } = getWeekBounds();
  let allEmails = [];
  try {
    // First batch via connector
    const result = await listEmails({ folderId, top, orderBy: 'receivedDateTime desc' });
    const emails = result?.value || result || [];
    const firstBatch = Array.isArray(emails) ? emails : [];
    if (firstBatch.length === 0) return [];
    allEmails = firstBatch;

    // Check if we need more - oldest email still within week and got full batch
    let oldest = firstBatch[firstBatch.length - 1];
    let oldestDate = new Date(oldest.receivedDateTime || oldest.DateTimeReceived);
    let skip = top;

    while (oldestDate >= start && allEmails.length === skip) {
      try {
        const moreResult = await callOutlookOperation('HttpRequest', {
          Uri: `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?$top=${top}&$skip=${skip}&$orderby=receivedDateTime desc`,
          Method: 'GET'
        });
        const parsed = typeof moreResult === 'string' ? JSON.parse(moreResult) : moreResult;
        const batch = parsed?.value || [];
        if (batch.length === 0) break;
        allEmails = allEmails.concat(batch);
        oldest = batch[batch.length - 1];
        oldestDate = new Date(oldest.receivedDateTime || oldest.DateTimeReceived);
        skip += top;
        if (batch.length < top) break;
      } catch (pageErr) {
        console.warn(`Pagination error for ${folderId} at skip=${skip}:`, pageErr);
        break;
      }
    }

    return allEmails;
  } catch (e) {
    console.error(`Email fetch error (${folderId}):`, e);
    return allEmails.length > 0 ? allEmails : [];
  }
}

async function fetchSentEmails() {
  const { start } = getWeekBounds();
  const filter = `sentDateTime ge ${start.toISOString()}`;
  try {
    const result = await callOutlookOperation('HttpRequest', {
      Uri: `https://graph.microsoft.com/v1.0/me/mailFolders/SentItems/messages?$top=200&$select=sentDateTime,subject,toRecipients&$filter=${encodeURIComponent(filter)}&$orderby=sentDateTime desc`,
      Method: 'GET'
    });
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const emails = parsed?.value || parsed || [];
    return Array.isArray(emails) ? emails : [];
  } catch (e) {
    console.error('Sent emails fetch error:', e);
    return [];
  }
}

async function fetchTeamsChats() {
  // Strategy 1: Use GetChats with chatType="all" and topic="all"
  try {
    const result = await GetChats('all', 'all');
    const chats = result?.value || result || [];
    return Array.isArray(chats) ? chats : [];
  } catch (e1) {
    console.warn('GetChats(all,all) failed:', e1?.message || e1);
  }

  // Strategy 2: Try chatType="oneOnOne" (most common chat type)
  try {
    const result = await GetChats('oneOnOne', 'all');
    const chats = result?.value || result || [];
    return Array.isArray(chats) ? chats : [];
  } catch (e2) {
    console.warn('GetChats(oneOnOne,all) failed:', e2?.message || e2);
  }

  // Strategy 3: Use Teams HttpRequest to call Graph /me/chats
  try {
    const graphResult = await HttpRequest(
      'https://graph.microsoft.com/v1.0/me/chats?$top=50&$orderby=lastMessagePreview/createdDateTime desc',
      'GET'
    );
    const parsed = typeof graphResult === 'string' ? JSON.parse(graphResult) : graphResult;
    const chats = parsed?.value || parsed || [];
    return Array.isArray(chats) ? chats : [];
  } catch (e3) {
    console.warn('HttpRequest /me/chats failed:', e3?.message || e3);
  }

  // Strategy 4: Try Graph beta endpoint
  try {
    const graphResult = await HttpRequest(
      'https://graph.microsoft.com/beta/me/chats?$top=50',
      'GET'
    );
    const parsed = typeof graphResult === 'string' ? JSON.parse(graphResult) : graphResult;
    const chats = parsed?.value || parsed || [];
    return Array.isArray(chats) ? chats : [];
  } catch (e4) {
    console.error('All Teams chat fetch strategies failed:', e4?.message || e4);
    return null;
  }
}

// ── Processing ─────────────────────────────────────────────────
function parseEventStart(e) {
  // Handle: startWithTimeZone (has offset), start.dateTime (object), start (flat string)
  return new Date(e.startWithTimeZone || e.start?.dateTime || e.start || e.Start || e.startDateTime);
}

function parseEventEnd(e) {
  return new Date(e.endWithTimeZone || e.end?.dateTime || e.end || e.End || e.endDateTime);
}

function processCalendar(events) {
  const { start, end } = getWeekBounds();
  const now = new Date();
  const weekEvents = events.filter(e => {
    const eStart = parseEventStart(e);
    return !isNaN(eStart) && eStart >= start && eStart <= end;
  });

  weekEvents.sort((a, b) => parseEventStart(a) - parseEventStart(b));

  const total = weekEvents.length;
  let completed = 0;
  let totalMinutes = 0;
  let minutesSoFar = 0;

  weekEvents.forEach(e => {
    const eStart = parseEventStart(e);
    const eEnd = parseEventEnd(e);
    const duration = (eEnd - eStart) / 60000;
    totalMinutes += duration;

    if (eEnd <= now) {
      completed++;
      minutesSoFar += duration;
    } else if (eStart <= now && eEnd > now) {
      const elapsed = (now - eStart) / 60000;
      minutesSoFar += elapsed;
    }
  });

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    percent,
    totalMinutes: Math.round(totalMinutes),
    minutesSoFar: Math.round(minutesSoFar),
    events: weekEvents
  };
}

function extractSenderName(e) {
  // Standard Graph API format
  if (e.from && typeof e.from === 'object' && e.from.emailAddress?.name) {
    return e.from.emailAddress.name;
  }
  // Check internetMessageHeaders for "From" header with display name
  if (Array.isArray(e.internetMessageHeaders)) {
    const fromHeader = e.internetMessageHeaders.find(h => h.name === 'From');
    if (fromHeader?.value) {
      // Parse "Display Name" <email> or Display Name <email>
      const quoted = fromHeader.value.match(/^"([^"]+)"/);
      if (quoted) return quoted[1];
      const unquoted = fromHeader.value.match(/^([^<]+)\s*</);
      if (unquoted) return unquoted[1].trim();
    }
  }
  // from is a plain email string - format it as a name
  const email = typeof e.from === 'string' ? e.from : '';
  if (email) {
    const local = email.split('@')[0];
    return local.split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return 'Unknown';
}

function processEmails(inboxEmails, deletedEmails) {
  const { start, end } = getWeekBounds();
  const allReceived = [...inboxEmails, ...deletedEmails].filter(e => {
    const received = new Date(e.receivedDateTime || e.DateTimeReceived);
    return received >= start && received <= end;
  });

  const senderMap = {};
  allReceived.forEach(e => {
    const name = extractSenderName(e);
    senderMap[name] = (senderMap[name] || 0) + 1;
  });

  const sorted = Object.entries(senderMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return { totalReceived: allReceived.length, senders: sorted };
}

function processSentEmails(sentEmails) {
  // Already filtered server-side to this week; just count
  return sentEmails.length;
}

function processTeams(chats) {
  if (chats === null) return { weekCount: null, todayCount: null, weekChats: [], todayChats: [] };
  const { start, end } = getWeekBounds();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const activeThisWeek = chats.filter(c => {
    const lastUpdated = new Date(c.lastUpdatedDateTime || c.lastMessagePreview?.createdDateTime || 0);
    return lastUpdated >= start && lastUpdated <= end;
  });

  const activeToday = chats.filter(c => {
    const lastUpdated = new Date(c.lastUpdatedDateTime || c.lastMessagePreview?.createdDateTime || 0);
    return lastUpdated >= today && lastUpdated < tomorrow;
  });

  return { weekCount: activeThisWeek.length, todayCount: activeToday.length, weekChats: activeThisWeek, todayChats: activeToday };
}

// ── UI Rendering ───────────────────────────────────────────────
function renderDashboard(calendar, emailData, sentCount, teamsResult) {
  document.getElementById('valMeetings').textContent = calendar.total;
  document.getElementById('subMeetings').textContent = `${calendar.completed} completed`;
  document.getElementById('valEmailsIn').textContent = emailData.totalReceived;
  document.getElementById('valEmailsOut').textContent = sentCount;
  document.getElementById('valTeams').textContent = teamsResult.weekCount === null ? '–' : teamsResult.weekCount;
  document.getElementById('valTeamsBig').textContent = teamsResult.todayCount === null ? '–' : teamsResult.todayCount;
  if (teamsResult.todayCount === null) {
    document.getElementById('teamsLabel').textContent = 'Unavailable';
  } else {
    document.getElementById('teamsLabel').textContent = 'Chats today';
  }

  // Progress
  document.getElementById('progressFill').style.width = calendar.percent + '%';
  document.getElementById('progressPercent').textContent = calendar.percent + '%';
  document.getElementById('progressDetail').textContent = `${calendar.completed} of ${calendar.total} meetings completed`;

  // Time stats
  document.getElementById('valTotalTime').textContent = formatHours(calendar.totalMinutes);
  document.getElementById('valTimeSoFar').textContent = formatHours(calendar.minutesSoFar);
  document.getElementById('valTimeRemaining').textContent = formatHours(calendar.totalMinutes - calendar.minutesSoFar);
}

function renderMeetingsList(events) {
  const container = document.getElementById('meetingsList');
  const now = new Date();

  const grouped = {};
  events.forEach(e => {
    const eStart = parseEventStart(e);
    const dayKey = eStart.toDateString();
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(e);
  });

  let html = '';
  const today = new Date().toDateString();

  Object.keys(grouped).forEach(dayKey => {
    const dayDate = new Date(dayKey);
    const isToday = dayKey === today;
    html += `<div class="day-header">${getDayLabel(dayDate)}${isToday ? ' <span class="today-badge">TODAY</span>' : ''}</div>`;

    grouped[dayKey].forEach(e => {
      const eStart = parseEventStart(e);
      const eEnd = parseEventEnd(e);
      const isPast = eEnd <= now;
      const isCurrent = eStart <= now && eEnd > now;
      const cls = isCurrent ? 'current' : isPast ? 'past' : '';
      const subject = e.subject || e.Subject || 'No Subject';

      html += `<div class="meeting-item ${cls}">
        <div class="meeting-dot"></div>
        <div class="meeting-time">${formatTime(eStart)}–${formatTime(eEnd)}</div>
        <div class="meeting-title">${escapeHtml(subject)}</div>
      </div>`;
    });
  });

  container.innerHTML = html || '<div class="loading-state">No meetings this week</div>';
}

function renderEmailsList(senders) {
  const container = document.getElementById('emailsList');

  if (senders.length === 0) {
    container.innerHTML = '<div class="loading-state">No emails this week</div>';
    return;
  }

  let html = '';
  senders.forEach(s => {
    html += `<div class="email-row">
      <div class="email-name">${escapeHtml(s.name)}</div>
      <div class="email-count">${s.count}</div>
    </div>`;
  });

  container.innerHTML = html;
}

function renderChatsList(chats) {
  const container = document.getElementById('chatsList');

  if (chats.length === 0) {
    container.innerHTML = '<div class="loading-state">No chats this week</div>';
    return;
  }

  let html = '';
  chats.forEach(c => {
    const topic = c.topic || c.chatType || 'Chat';
    const members = c.members || [];
    let displayName = topic;
    if ((!topic || topic === 'oneOnOne' || topic === 'group') && c.lastMessagePreview?.from?.user?.displayName) {
      displayName = c.lastMessagePreview.from.user.displayName;
    } else if ((!topic || topic === 'oneOnOne' || topic === 'group') && members.length > 0) {
      displayName = members.map(m => m.displayName || m.userId).filter(Boolean).join(', ');
    }
    const lastTime = c.lastMessagePreview?.createdDateTime
      ? formatTime(new Date(c.lastMessagePreview.createdDateTime))
      : '';
    html += `<div class="email-row">
      <div class="email-name">${escapeHtml(displayName)}</div>
      <div class="email-count">${lastTime}</div>
    </div>`;
  });

  container.innerHTML = html;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Panel management ───────────────────────────────────────────
window.app = {
  openPanel(type) {
    document.getElementById('backdrop').classList.add('open');
    if (type === 'teamsWeek') {
      document.getElementById('teamsPanel').classList.add('open');
      document.getElementById('teamsPanelTitle').textContent = 'Chats This Week';
      renderChatsList(teamsWeekChats);
    } else if (type === 'teamsToday') {
      document.getElementById('teamsPanel').classList.add('open');
      document.getElementById('teamsPanelTitle').textContent = 'Chats Today';
      renderChatsList(teamsTodayChats);
    } else {
      document.getElementById(type + 'Panel').classList.add('open');
    }
    if (type === 'meetings') {
      setTimeout(() => {
        const todayBadge = document.querySelector('#meetingsPanel .today-badge');
        if (todayBadge) {
          todayBadge.closest('.day-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  },
  closePanel() {
    document.getElementById('backdrop').classList.remove('open');
    document.getElementById('meetingsPanel').classList.remove('open');
    document.getElementById('emailsPanel').classList.remove('open');
    document.getElementById('teamsPanel').classList.remove('open');
  }
};

// ── Refresh timer ──────────────────────────────────────────────
function startRefreshTimer() {
  refreshCountdown = REFRESH_INTERVAL;
  if (refreshTimerInterval) clearInterval(refreshTimerInterval);

  refreshTimerInterval = setInterval(() => {
    refreshCountdown -= 1000;
    if (refreshCountdown <= 0) {
      refreshCountdown = REFRESH_INTERVAL;
      loadData();
    }
    const secs = Math.floor(refreshCountdown / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    document.getElementById('refreshTimer').textContent = `Next update ${m}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

// ── Main data load ─────────────────────────────────────────────
async function loadData() {
  document.getElementById('refreshTimer').textContent = 'Updating...';

  const [calEvents, inboxEmails, deletedEmails, sentEmails, teamsChats] = await Promise.all([
    fetchCalendar(),
    fetchEmails('Inbox'),
    fetchEmails('DeletedItems'),
    fetchSentEmails(),
    fetchTeamsChats()
  ]);

  const calendar = processCalendar(calEvents);
  const emailData = processEmails(inboxEmails, deletedEmails);
  const sentCount = processSentEmails(sentEmails);
  const teamsResult = processTeams(teamsChats);

  meetingsData = calendar.events;
  emailSenders = emailData.senders;
  teamsWeekChats = teamsResult.weekChats;
  teamsTodayChats = teamsResult.todayChats;

  renderDashboard(calendar, emailData, sentCount, teamsResult);
  renderMeetingsList(meetingsData);
  renderEmailsList(emailSenders);
  renderChatsList(teamsWeekChats);
}

// ── Boot ───────────────────────────────────────────────────────
function showLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:#fff;display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:16px;';
  overlay.innerHTML = '<div class="spinner" style="width:24px;height:24px;border:3px solid #f0f0f0;border-top-color:#2563eb;border-radius:50%;animation:spin 0.8s linear infinite"></div><span style="font-size:13px;color:#9ca3af">Loading your week...</span>';
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.remove();
}

async function boot() {
  showLoadingOverlay();
  const { start, end } = getWeekBounds();
  document.getElementById('weekRange').textContent = formatWeekRange(start, end);

  await loadData();
  hideLoadingOverlay();
  startRefreshTimer();
}

boot();