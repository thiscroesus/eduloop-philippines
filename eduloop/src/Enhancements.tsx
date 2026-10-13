import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock3, Map as MapIcon, MapPin,
  MessageCircle, Minimize2, Maximize2, Navigation, Package, Plus, Send, X,
  BookOpen, Search, MapPinned, ExternalLink
} from 'lucide-react';
import type { Material, Resource, User } from './data';

export type ChatTarget = {
  listingId: string;
  listingTitle: string;
  listingType: 'Resource' | 'Material';
  recipientId: string;
  recipientName: string;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  listingId: string;
  listingTitle: string;
  listingType: 'Resource' | 'Material';
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  createdAt: string;
};

const CHAT_STORAGE_KEY = 'eduloop-chat-v1';

function readChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function conversationId(target: ChatTarget, currentUserId: string) {
  return [target.listingId, ...[currentUserId, target.recipientId].sort()].join('::');
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function ChatDock({
  currentUser,
  target,
  onClearTarget,
  onRequireLogin,
}: {
  currentUser: User | null;
  target: ChatTarget | null;
  onClearTarget: () => void;
  onRequireLogin: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(readChatMessages);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ChatTarget | null>(null);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)); } catch { /* Browser storage may be unavailable. */ }
  }, [messages]);

  useEffect(() => {
    if (target) {
      setActive(target);
      setOpen(true);
      setDraft('');
      onClearTarget();
    }
  }, [target, onClearTarget]);

  const myMessages = useMemo(
    () => currentUser ? messages.filter((message) => message.senderId === currentUser.id || message.recipientId === currentUser.id) : [],
    [messages, currentUser]
  );

  const threads = useMemo(() => {
    if (!currentUser) return [];
    const grouped = new Map<string, { target: ChatTarget; messages: ChatMessage[] }>();
    myMessages.forEach((message) => {
      const otherId = message.senderId === currentUser.id ? message.recipientId : message.senderId;
      const otherName = message.senderId === currentUser.id ? message.recipientName : message.senderName;
      const targetInfo: ChatTarget = {
        listingId: message.listingId,
        listingTitle: message.listingTitle,
        listingType: message.listingType,
        recipientId: otherId,
        recipientName: otherName,
      };
      if (!grouped.has(message.conversationId)) grouped.set(message.conversationId, { target: targetInfo, messages: [] });
      grouped.get(message.conversationId)?.messages.push(message);
    });
    return [...grouped.values()].map((thread) => ({
      ...thread,
      messages: thread.messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    })).sort((a, b) => (b.messages[b.messages.length - 1]?.createdAt || '').localeCompare(a.messages[a.messages.length - 1]?.createdAt || ''));
  }, [myMessages, currentUser]);

  const activeConversationId = currentUser && active ? conversationId(active, currentUser.id) : '';
  const activeMessages = activeConversationId
    ? messages.filter((message) => message.conversationId === activeConversationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];

  useEffect(() => {
    if (open && active) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [open, active, activeMessages.length]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !active || !draft.trim()) return;
    if (active.recipientId === currentUser.id) return;
    const next: ChatMessage = {
      id: 'chat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      conversationId: activeConversationId,
      listingId: active.listingId,
      listingTitle: active.listingTitle,
      listingType: active.listingType,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: active.recipientId,
      recipientName: active.recipientName,
      text: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((previous) => [...previous, next]);
    setDraft('');
  };

  const beginThread = (nextTarget: ChatTarget) => {
    setActive(nextTarget);
    setDraft('');
  };

  return <>
    <button className="floating-chat-launcher" onClick={() => {
      if (!currentUser) { onRequireLogin(); return; }
      setOpen((value) => !value);
      if (!active && threads.length) setActive(threads[0].target);
    }} aria-label="Open EduLoop chat" aria-expanded={open}>
      <MessageCircle size={21} /><span>Chat</span>{threads.length > 0 && <b>{threads.length}</b>}
    </button>
    {open && <section className="chat-dock" role="dialog" aria-label="EduLoop messages">
      <header className="chat-dock-header">
        <span className="chat-dock-icon"><MessageCircle size={18} /></span>
        <div><strong>EduLoop chat</strong><small>{currentUser ? 'Ask about a listing' : 'Sign in to message'}</small></div>
        {active && <button className="chat-header-back" onClick={() => setActive(null)} title="All conversations">Inbox</button>}
        <button className="chat-dock-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
      </header>
      {!currentUser ? <div className="chat-empty"><MessageCircle size={30} /><p>Log in to message a resource provider or material owner.</p><button className="btn btn-primary" onClick={onRequireLogin}>Log in</button></div>
        : active ? <>
          <div className="chat-thread-context">
            <span className="chat-context-avatar">{active.recipientName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
            <div><strong>{active.recipientName}</strong><small>{active.listingType} · {active.listingTitle}</small></div>
          </div>
          <div className="chat-messages">
            {activeMessages.length === 0 && <div className="chat-first-message"><MessageCircle size={22} /><strong>Start the conversation</strong><p>Ask about availability, item condition, pickup arrangements, or how to access this resource.</p></div>}
            {activeMessages.map((message) => <div key={message.id} className={'chat-message-row ' + (message.senderId === currentUser.id ? 'chat-message-mine' : 'chat-message-theirs')}>
              <div className="chat-message-bubble"><p>{message.text}</p><small>{message.senderId === currentUser.id ? 'You' : message.senderName} · {relativeTime(message.createdAt)}</small></div>
            </div>)}
            <div ref={bottomRef} />
          </div>
          <form className="chat-compose" onSubmit={sendMessage}>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={800} placeholder="Write a message..." aria-label="Message text" />
            <button className="btn btn-primary" type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={16} /></button>
          </form>
          <p className="chat-demo-note">Prototype only: chat messages are stored in this browser and do not sync across devices.</p>
        </> : <>
          <div className="chat-inbox-list">
            {threads.length ? threads.map((thread) => {
              const last = thread.messages[thread.messages.length - 1];
              return <button key={conversationId(thread.target, currentUser.id)} className="chat-inbox-thread" onClick={() => beginThread(thread.target)}>
                <span className="chat-context-avatar">{thread.target.recipientName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
                <span className="chat-inbox-copy"><strong>{thread.target.recipientName}</strong><small>{thread.target.listingTitle}</small><em>{last.text}</em></span><ChevronRight size={16} />
              </button>;
            }) : <div className="chat-empty"><MessageCircle size={30} /><strong>No conversations yet</strong><p>Open a resource or material listing and select “Message poster” to start a chat.</p></div>}
          </div>
          <p className="chat-demo-note">Prototype only: messages stay in this browser. Online cross-device chat requires a shared backend.</p>
        </>}
    </section>}
  </>;
}

export type CalendarEntry = {
  id: string;
  userId: string;
  resourceId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  provider: string;
};

function formatCalendarDate(iso: string) {
  const date = new Date(iso + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatMonth(date: Date) {
  return date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

export function DashboardCalendar({
  resources,
  entries,
  onAdd,
  onRemove,
}: {
  resources: Resource[];
  entries: CalendarEntry[];
  onAdd: (resource: Resource) => void;
  onRemove: (entryId: string) => void;
}) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (days.length % 7) days.push(null);
  const savedByDate = useMemo(() => entries.reduce<Record<string, CalendarEntry[]>>((result, item) => {
    result[item.date] = [...(result[item.date] || []), item];
    return result;
  }, {}), [entries]);
  const todayKey = new Date().toLocaleDateString('en-CA');
  const upcoming = [...entries].filter((entry) => entry.date >= todayKey).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const available = resources.filter((resource) => resource.isAnnouncedEvent && resource.eventDate && resource.eventStartTime && resource.eventEndTime && resource.eventDate >= todayKey && !entries.some((entry) => entry.resourceId === resource.id));

  return <section className="content-card schedule-calendar-card">
    <div className="card-header-line">
      <div><span className="eyebrow"><CalendarDays size={14} /> SCHEDULE</span><h2>Your learning calendar</h2><p className="calendar-subtitle">Only announced events with a specific date and time can be added.</p></div>
      <div className="calendar-month-controls"><button className="icon-button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button><strong>{formatMonth(month)}</strong><button className="icon-button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button></div>
    </div>
    <div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="calendar-day-grid">{days.map((day, index) => {
      const iso = day ? month.getFullYear() + '-' + String(month.getMonth() + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0') : '';
      const dayItems = savedByDate[iso] || [];
      const isToday = iso === todayKey;
      return <div className={'calendar-day ' + (day ? '' : 'calendar-day-blank') + (isToday ? ' calendar-today' : '') + (dayItems.length ? ' calendar-has-event' : '')} key={index}>
        {day && <><span className="calendar-day-number">{day}</span>{dayItems.length > 0 && <span className="calendar-event-count" title={dayItems.map((item) => item.title).join(', ')}>{dayItems.length} event{dayItems.length > 1 ? 's' : ''}</span>}</>}
      </div>;
    })}</div>
    <div className="calendar-columns">
      <div><div className="calendar-section-title"><h3>Saved to your schedule</h3><span className="count-bubble">{entries.length}</span></div>
        {upcoming.length ? <div className="calendar-event-list">{upcoming.map((event) => <article className="calendar-event-row" key={event.id}><span className="calendar-date-tile"><strong>{new Date(event.date + 'T12:00:00').getDate()}</strong><small>{new Date(event.date + 'T12:00:00').toLocaleDateString('en-PH', { month: 'short' })}</small></span><div className="calendar-event-copy"><strong>{event.title}</strong><span><Clock3 size={13} /> {event.startTime}–{event.endTime}</span><small><MapPin size={13} /> {event.location} · {event.provider}</small></div><button className="icon-button" title="Remove from calendar" aria-label={'Remove ' + event.title + ' from calendar'} onClick={() => onRemove(event.id)}><X size={16} /></button></article>)}</div> : <p className="calendar-empty-copy">Your schedule is empty. Add an announced event from its resource page.</p>}
      </div>
      <div><div className="calendar-section-title"><h3>Announced events you can add</h3><span className="count-bubble">{available.length}</span></div>
        {available.length ? <div className="calendar-event-list">{available.map((resource) => <article className="calendar-event-row calendar-event-available" key={resource.id}><span className="calendar-date-tile calendar-date-tile-open"><CalendarDays size={20} /></span><div className="calendar-event-copy"><strong>{resource.title}</strong><span><Clock3 size={13} /> {formatCalendarDate(resource.eventDate || '')} · {resource.eventStartTime}–{resource.eventEndTime}</span><small><MapPin size={13} /> {resource.city}</small></div><button className="btn btn-soft btn-sm" onClick={() => onAdd(resource)}><Plus size={14} /> Add</button></article>)}</div> : <p className="calendar-empty-copy">No new announced events are available to add right now.</p>}
      </div>
    </div>
  </section>;
}

type GeoPoint = { lat: number; lon: number };
type NearbyResult = { id: string; title: string; kind: 'Resource' | 'Material'; city: string; region: string; description: string; point: GeoPoint; resource?: Resource; material?: Material; distance: number };

const CITY_POINTS: Array<{ names: string[]; point: GeoPoint }> = [
  { names: ['lapu-lapu', 'lapulapu'], point: { lat: 10.3103, lon: 123.9494 } },
  { names: ['cebu city', 'cebu, cebu'], point: { lat: 10.3157, lon: 123.8854 } },
  { names: ['tacloban'], point: { lat: 11.244, lon: 125.003 } },
  { names: ['iloilo'], point: { lat: 10.7202, lon: 122.5621 } },
  { names: ['davao'], point: { lat: 7.1907, lon: 125.4553 } },
  { names: ['cagayan de oro'], point: { lat: 8.4542, lon: 124.6319 } },
  { names: ['baguio'], point: { lat: 16.4023, lon: 120.596 } },
  { names: ['san fernando', 'angeles city'], point: { lat: 15.0343, lon: 120.6844 } },
  { names: ['zamboanga'], point: { lat: 6.9214, lon: 122.079 } },
  { names: ['tuguegarao'], point: { lat: 17.6132, lon: 121.7269 } },
  { names: ['butuan'], point: { lat: 8.9475, lon: 125.5406 } },
  { names: ['ormoc'], point: { lat: 11.0064, lon: 124.6075 } },
  { names: ['quezon city'], point: { lat: 14.676, lon: 121.0437 } },
  { names: ['manila'], point: { lat: 14.5995, lon: 120.9842 } },
  { names: ['legazpi', 'naga city'], point: { lat: 13.6218, lon: 123.1948 } },
  { names: ['calapan'], point: { lat: 13.4117, lon: 121.1803 } },
  { names: ['tarlac city'], point: { lat: 15.4755, lon: 120.5963 } },
];

function pointFromText(text: string): GeoPoint | null {
  const normalized = text.toLowerCase();
  const match = CITY_POINTS.find((item) => item.names.some((name) => normalized.includes(name)));
  return match ? match.point : null;
}
function distanceKm(a: GeoPoint, b: GeoPoint) {
  const rad = (value: number) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const v = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
function approxPoint(itemCity: string): GeoPoint | null {
  return pointFromText(itemCity);
}
function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
declare global {
  interface Window { L?: any; }
}
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.L) { resolve(window.L); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[data-eduloop-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Map library did not load.')), { once: true });
      existing.addEventListener('error', () => reject(new Error('Map library failed to load.')), { once: true });
      return;
    }
    if (!document.querySelector('link[data-eduloop-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.dataset.eduloopLeafletCss = 'true';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true; script.dataset.eduloopLeaflet = 'true';
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Map library did not load.'));
    script.onerror = () => reject(new Error('Map library failed to load.'));
    document.head.appendChild(script);
  });
}

export function DiscoveryMap({
  resources,
  materials,
  onOpenResource,
  onOpenMaterial,
}: {
  resources: Resource[];
  materials: Material[];
  onOpenResource: (id: string) => void;
  onOpenMaterial: (id: string) => void;
}) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('eduloop-map-enabled') === 'true');
  const [expanded, setExpanded] = useState(false);
  const [place, setPlace] = useState(() => localStorage.getItem('eduloop-map-place') || '');
  const [center, setCenter] = useState<GeoPoint | null>(() => {
    try { const saved = localStorage.getItem('eduloop-map-center'); return saved ? JSON.parse(saved) as GeoPoint : null; } catch { return null; }
  });
  const [showResources, setShowResources] = useState(true);
  const [showMaterials, setShowMaterials] = useState(true);
  const [radius, setRadius] = useState('50');
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => { try { localStorage.setItem('eduloop-map-enabled', String(enabled)); localStorage.setItem('eduloop-map-place', place); if (center) localStorage.setItem('eduloop-map-center', JSON.stringify(center)); } catch { /* Storage optional in demo mode. */ } }, [enabled, place, center]);

  const nearby = useMemo<NearbyResult[]>(() => {
    if (!center) return [];
    const results: NearbyResult[] = [];
    if (showResources) resources.filter((item) => item.mode !== 'Online').forEach((resource) => {
      const point = approxPoint(resource.city);
      if (!point) return;
      const distance = distanceKm(center, point);
      if (distance <= Number(radius)) results.push({ id: resource.id, title: resource.title, kind: 'Resource', city: resource.city, region: resource.region, description: resource.shortDescription, point, resource, distance });
    });
    if (showMaterials) materials.filter((item) => item.availability === 'Available').forEach((material) => {
      const point = approxPoint(material.city);
      if (!point) return;
      const distance = distanceKm(center, point);
      if (distance <= Number(radius)) results.push({ id: material.id, title: material.title, kind: 'Material', city: material.city, region: material.region, description: material.description, point, material, distance });
    });
    return results.sort((a, b) => a.distance - b.distance);
  }, [resources, materials, center, showResources, showMaterials, radius]);

  const findPlace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = place.trim();
    if (!query) { setMapError('Enter a city, municipality, or area first.'); return; }
    setIsSearching(true); setMapError('');
    try {
      let next = pointFromText(query);
      if (!next) {
        const response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query + ', Philippines'));
        if (!response.ok) throw new Error('Location search is unavailable right now.');
        const result = await response.json() as Array<{ lat: string; lon: string }>;
        if (result.length) next = { lat: Number(result[0].lat), lon: Number(result[0].lon) };
      }
      if (!next || !Number.isFinite(next.lat) || !Number.isFinite(next.lon)) throw new Error('We could not find that area. Try a nearby city or municipality name.');
      setCenter(next); setExpanded(true);
    } catch (error) {
      setMapError(error instanceof Error ? error.message : 'Could not look up the selected area.');
    } finally { setIsSearching(false); }
  };

  useEffect(() => {
    if (!enabled || !expanded || !center || !mapElement.current) return;
    let cancelled = false;
    let map: any = null;
    loadLeaflet().then((L) => {
      if (cancelled || !mapElement.current) return;
      map = L.map(mapElement.current, { scrollWheelZoom: false }).setView([center.lat, center.lon], 11);
      mapInstance.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
      }).addTo(map);
      const markers: any[] = [];
      L.marker([center.lat, center.lon]).addTo(map).bindPopup('<strong>Your selected area</strong><br/>Map center only; no live GPS is used.');
      nearby.forEach((item) => {
        const popup = '<strong>' + escapeHtml(item.title) + '</strong><br/>' + escapeHtml(item.kind) + ' · Approximate city-level location<br/>' + Math.round(item.distance) + ' km from selected area';
        markers.push(L.marker([item.point.lat, item.point.lon]).addTo(map).bindPopup(popup));
      });
      if (markers.length) {
        const points = [[center.lat, center.lon], ...nearby.map((item) => [item.point.lat, item.point.lon])];
        map.fitBounds(points, { padding: [22, 22], maxZoom: 12 });
      }
      setMapReady(true);
      window.setTimeout(() => map?.invalidateSize(), 100);
    }).catch(() => setMapError('Map tiles could not load. Check your internet connection and try again.'));
    return () => {
      cancelled = true;
      if (map) map.remove();
      if (mapInstance.current === map) mapInstance.current = null;
      setMapReady(false);
    };
  }, [enabled, expanded, center, nearby]);

  if (!enabled) return <button className="floating-map-launcher" onClick={() => setEnabled(true)}><MapIcon size={19} /> Nearby map</button>;

  return <>
    {!expanded && <button className="floating-map-launcher" onClick={() => setExpanded(true)}><MapPinned size={19} /><span>Nearby map</span>{nearby.length > 0 && <b>{nearby.length}</b>}<button className="floating-map-off-inline" onClick={(event) => { event.stopPropagation(); setEnabled(false); }} aria-label="Turn off map"><X size={14} /></button></button>}
    {expanded && <section className="discovery-map-dock" role="dialog" aria-label="Nearby learning resource map">
      <header className="discovery-map-header"><span className="map-header-icon"><MapPinned size={18} /></span><div><strong>Nearby learning map</strong><small>Explore the area you choose</small></div><button className="map-mini-action" onClick={() => setExpanded(false)} aria-label="Minimize map"><Minimize2 size={16} /></button><button className="map-mini-action" onClick={() => setEnabled(false)} aria-label="Turn off map"><X size={17} /></button></header>
      <form className="map-location-form" onSubmit={findPlace}><label htmlFor="eduloop-map-place">Enter a city or municipality</label><div><MapPin size={16} /><input id="eduloop-map-place" value={place} onChange={(event) => setPlace(event.target.value)} placeholder="e.g. Lapu-Lapu City, Cebu" /><button className="btn btn-primary btn-sm" type="submit" disabled={isSearching}>{isSearching ? 'Finding…' : 'Find'}</button></div></form>
      <div className="map-filter-row">
        <label><input type="checkbox" checked={showResources} onChange={(event) => setShowResources(event.target.checked)} /> Learning resources</label>
        <label><input type="checkbox" checked={showMaterials} onChange={(event) => setShowMaterials(event.target.checked)} /> Materials</label>
        <label className="map-radius-label">Radius<select value={radius} onChange={(event) => setRadius(event.target.value)}><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option><option value="250">250 km</option></select></label>
      </div>
      {mapError && <p className="map-error" role="status">{mapError}</p>}
      <div ref={mapElement} className="leaflet-map-canvas">{!center && <div className="map-placeholder"><MapIcon size={28} /><strong>Choose your area to begin</strong><span>Markers use approximate city-center locations for demo listings.</span></div>}</div>
      <div className="map-results-heading"><strong>{nearby.length} nearby demo listing{nearby.length === 1 ? '' : 's'}</strong><small>{center ? 'Sorted by approximate city-center distance' : 'Search for an area to see results'}</small></div>
      <div className="map-nearby-results">{nearby.slice(0, 12).map((item) => <button className="map-result-item" key={item.kind + item.id} onClick={() => item.kind === 'Resource' ? onOpenResource(item.id) : onOpenMaterial(item.id)}><span className={'map-result-icon ' + (item.kind === 'Resource' ? 'map-resource-icon' : 'map-material-icon')}>{item.kind === 'Resource' ? <BookOpen size={16} /> : <Package size={16} />}</span><span><strong>{item.title}</strong><small>{item.city} · about {Math.round(item.distance)} km</small></span><ExternalLink size={14} /></button>)}{center && nearby.length === 0 && <p className="map-no-results">No demo listings found within {radius} km. Try widening the radius or enabling both categories.</p>}</div>
      <p className="map-attribution">Map © OpenStreetMap contributors. Pins represent approximate city-center locations, not exact pickup addresses. Entered location is sent to OpenStreetMap only when you search.</p>
    </section>}
  </>;
}
