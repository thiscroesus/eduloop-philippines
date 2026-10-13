import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Accessibility, ArrowDownRight, ArrowLeft, ArrowRight, BadgeCheck, Bell, BookMarked, BookOpen,
  Bookmark, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Code2, Coffee, Compass,
  FileText, Filter, FlaskConical, Globe, HandHeart, HeartHandshake, Home, Info, Laptop,
  Library, LogIn, LogOut, MapPin, Menu, Monitor, Package, Palette, PencilRuler, Plus,
  Search, Send, Settings2, ShieldCheck, Sparkles, Star, TrendingUp, User, UserPlus, Users,
  X, Calculator, NotebookPen, Usb, PenTool, Headphones, MessageSquareWarning, Trash2, ExternalLink,
  CalendarDays, CircleDollarSign, School, Eye, EyeOff, Mail, LockKeyhole, UserRound, CircleCheck, MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { ChatDock, DashboardCalendar, DiscoveryMap, type CalendarEntry, type ChatTarget } from './Enhancements';
import {
  AppNotification, AppState, DEMO_ADMIN_CODE, Material, RequestRecord, RequestStatus,
  Resource, Role, STORAGE_KEY, makeInitialState, materialCategories, philippineRegions,
  resourceCategories,
} from './data';

type AuthMode = 'login' | 'register' | null;
type Notice = { type: 'success' | 'error' | 'info'; message: string };

const iconMap: Record<string, LucideIcon> = {
  Accessibility, BookMarked, BookOpen, Calculator, Coffee, Code2, FileText, FlaskConical,
  Globe, Laptop, Library, Monitor, NotebookPen, Palette, PencilRuler, Users, Usb, PenTool,
  Headphones, Package, School, Compass, HeartHandshake,
};
function TileIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = iconMap[name] || BookOpen;
  return <Icon size={size} strokeWidth={1.8} />;
}
function makeId(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function dateLabel(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'E'; }

export default function App() {
  const [app, setApp] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.resources) && Array.isArray(parsed.materials)) {
          // Upgrade saved browser demo data without discarding existing users, requests or listings.
          // In particular, add new announced-event/contact fields to seed records from older versions.
          const fresh = makeInitialState();
          const eventSeeds = fresh.resources.filter((item) => item.isAnnouncedEvent && item.eventDate && item.eventStartTime && item.eventEndTime);
          const migratedResources = parsed.resources.map((item) => {
            const seed = eventSeeds.find((candidate) => candidate.id === item.id);
            if (!seed || item.isAnnouncedEvent) return item;
            return { ...item, isAnnouncedEvent: true, eventDate: seed.eventDate, eventStartTime: seed.eventStartTime, eventEndTime: seed.eventEndTime, contactMethod: item.contactMethod || seed.contactMethod };
          });
          return { ...fresh, ...parsed, resources: migratedResources,
            requests: Array.isArray(parsed.requests) ? parsed.requests : fresh.requests,
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : fresh.notifications,
            reports: Array.isArray(parsed.reports) ? parsed.reports : fresh.reports,
            activity: Array.isArray(parsed.activity) ? parsed.activity : fresh.activity,
            savedItems: parsed.savedItems || {},
            recentlyViewed: parsed.recentlyViewed || {},
          };
        }
      }
    } catch { /* Recover by loading fresh fictional demo data. */ }
    return makeInitialState();
  });
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#/, '') || '/');
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [authError, setAuthError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategory, setResourceCategory] = useState('All categories');
  const [resourceRegion, setResourceRegion] = useState('All regions');
  const [resourceCost, setResourceCost] = useState('Any cost');
  const [resourceMode, setResourceMode] = useState('Any mode');
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialCategory, setMaterialCategory] = useState('All categories');
  const [materialRegion, setMaterialRegion] = useState('All regions');
  const [materialType, setMaterialType] = useState('Any exchange');
  const [materialCondition, setMaterialCondition] = useState('Any condition');
  const [requestMaterial, setRequestMaterial] = useState<Material | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; type: 'Resource' | 'Material' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reportDetails, setReportDetails] = useState<{ title: string; type: 'Resource' | 'Material'; id: string } | null>(null);
  const [reportReason, setReportReason] = useState('Incorrect or misleading information');
  const [reportText, setReportText] = useState('');
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>(() => {
    try {
      const saved = localStorage.getItem('eduloop-calendar-v1');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(app)); } catch { /* Browser storage may be disabled or full. */ }
  }, [app]);
  useEffect(() => {
    try { localStorage.setItem('eduloop-calendar-v1', JSON.stringify(calendarEntries)); } catch { /* Browser storage may be unavailable. */ }
  }, [calendarEntries]);
  useEffect(() => { setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [route]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const currentUser = app.users.find((user) => user.id === app.currentUserId) || null;
  const isAdmin = currentUser?.role === 'Administrator';
  const unreadCount = currentUser ? app.notifications.filter((n) => n.userId === currentUser.id && !n.read).length : 0;
  const approvedResources = useMemo(() => app.resources.filter((item) => item.status === 'Approved'), [app.resources]);
  const approvedMaterials = useMemo(() => app.materials.filter((item) => item.status === 'Approved'), [app.materials]);

  const updateApp = (change: (previous: AppState) => AppState) => setApp((previous) => change(previous));
  const navigate = (path: string) => {
    if (window.location.hash !== `#${path}`) window.location.hash = path;
    else setRoute(path);
  };
  const announce = (message: string, type: Notice['type'] = 'success') => setNotice({ message, type });
  const requireUser = (callback: () => void) => {
    if (!currentUser) {
      setAuthMode('login');
      setAuthError('Please log in or create an account to continue.');
      return;
    }
    callback();
  };

  useEffect(() => {
    if (!currentUser) return;
    const resourceMatch = route.match(/^\/resources\/([^/]+)$/);
    const materialMatch = route.match(/^\/materials\/([^/]+)$/);
    const itemId = resourceMatch?.[1] || materialMatch?.[1];
    if (!itemId) return;
    updateApp((previous) => {
      const old = previous.recentlyViewed[currentUser.id] || [];
      if (old[0] === itemId) return previous;
      return { ...previous, recentlyViewed: { ...previous.recentlyViewed, [currentUser.id]: [itemId, ...old.filter((id) => id !== itemId)].slice(0, 6) } };
    });
    // Only route and account changes should register a view, not state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, currentUser?.id]);

  function addNotification(userId: string, title: string, message: string): AppNotification {
    return { id: makeId('n'), userId, title, message, createdAt: new Date().toISOString(), read: false };
  }
  function logActivity(message: string) {
    return { id: makeId('a'), message, createdAt: new Date().toISOString() };
  }

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthError('');
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    const role = String(form.get('role') || 'Student') as Role;
    const region = String(form.get('region') || 'Central Visayas');
    const affiliation = String(form.get('affiliation') || '').trim();
    const adminCode = String(form.get('adminCode') || '').trim();
    if (!name || !email || !password) { setAuthError('Please complete all required fields.'); return; }
    if (password.length < 6) { setAuthError('Use at least 6 characters for the prototype password.'); return; }
    if (app.users.some((user) => user.email.toLowerCase() === email)) { setAuthError('An account with this email already exists. Try logging in instead.'); return; }
    if (role === 'Administrator' && adminCode !== DEMO_ADMIN_CODE) { setAuthError(`For this prototype, administrators need the demo code: ${DEMO_ADMIN_CODE}`); return; }
    const newUser = { id: makeId('u'), name, email, password, role, region, schoolOrOrganization: affiliation || (role === 'Student' ? 'Independent learner' : role === 'Contributor' ? 'Community contributor' : 'EduLoop demo administrator'), joinedAt: new Date().toISOString() };
    updateApp((previous) => ({
      ...previous,
      users: [...previous.users, newUser], currentUserId: newUser.id,
      notifications: [...previous.notifications, { id: makeId('n'), userId: newUser.id, title: 'Welcome to EduLoop!', message: `Your ${role.toLowerCase()} account is ready. Explore resources and help make learning materials go further.`, createdAt: new Date().toISOString(), read: false }],
      activity: [logActivity(`${name} registered as ${role} (prototype account).`), ...previous.activity].slice(0, 40),
    }));
    setAuthMode(null); setAuthError(''); setShowPassword(false);
    announce(`Welcome to EduLoop, ${name.split(' ')[0]}!`);
    navigate('/dashboard');
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    const user = app.users.find((candidate) => candidate.email.toLowerCase() === email && candidate.password === password);
    if (!user) { setAuthError('Email or password did not match. Use a demo account or create a new account.'); return; }
    updateApp((previous) => ({ ...previous, currentUserId: user.id, activity: [logActivity(`${user.name} signed in (prototype session).`), ...previous.activity].slice(0, 40) }));
    setAuthMode(null); setAuthError(''); setShowPassword(false); setProfileMenu(false);
    announce(`Good to see you again, ${user.name.split(' ')[0]}.`);
    navigate('/dashboard');
  };

  const loginAsDemo = (email: string, password: string) => {
    const user = app.users.find((candidate) => candidate.email === email && candidate.password === password);
    if (!user) { setAuthError('That demo account is missing. Reset browser demo data and reload.'); return; }
    updateApp((previous) => ({ ...previous, currentUserId: user.id }));
    setAuthMode(null); setAuthError(''); setShowPassword(false); announce(`Signed in as ${user.role.toLowerCase()} demo user.`); navigate('/dashboard');
  };

  const logout = () => {
    updateApp((previous) => ({ ...previous, currentUserId: null })); setProfileMenu(false); announce('You have logged out.'); navigate('/');
  };

  const filteredResources = useMemo(() => {
    const term = resourceSearch.trim().toLowerCase();
    return approvedResources.filter((resource) => {
      const matchesTerm = !term || [resource.title, resource.shortDescription, resource.description, resource.organization, resource.city, ...resource.subjects].join(' ').toLowerCase().includes(term);
      return matchesTerm && (resourceCategory === 'All categories' || resource.category === resourceCategory)
        && (resourceRegion === 'All regions' || resource.region === resourceRegion)
        && (resourceCost === 'Any cost' || resource.cost === resourceCost)
        && (resourceMode === 'Any mode' || resource.mode === resourceMode);
    });
  }, [approvedResources, resourceSearch, resourceCategory, resourceRegion, resourceCost, resourceMode]);
  const filteredMaterials = useMemo(() => {
    const term = materialSearch.trim().toLowerCase();
    return approvedMaterials.filter((material) => {
      const matchesTerm = !term || [material.title, material.description, material.category, material.city, material.ownerName, ...material.includedItems].join(' ').toLowerCase().includes(term);
      return matchesTerm && (materialCategory === 'All categories' || material.category === materialCategory)
        && (materialRegion === 'All regions' || material.region === materialRegion)
        && (materialType === 'Any exchange' || material.exchangeType === materialType)
        && (materialCondition === 'Any condition' || material.condition === materialCondition);
    });
  }, [approvedMaterials, materialSearch, materialCategory, materialRegion, materialType, materialCondition]);

  const clearResourceFilters = () => { setResourceSearch(''); setResourceCategory('All categories'); setResourceRegion('All regions'); setResourceCost('Any cost'); setResourceMode('Any mode'); };
  const clearMaterialFilters = () => { setMaterialSearch(''); setMaterialCategory('All categories'); setMaterialRegion('All regions'); setMaterialType('Any exchange'); setMaterialCondition('Any condition'); };

  const submitResource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const description = String(form.get('description') || '').trim();
    const isAnnouncedEvent = form.get('isAnnouncedEvent') === 'on';
    const eventDate = String(form.get('eventDate') || '');
    const eventStartTime = String(form.get('eventStartTime') || '');
    const eventEndTime = String(form.get('eventEndTime') || '');
    if (title.length < 4 || description.length < 20) { announce('Add a clear title and a description of at least 20 characters.', 'error'); return; }
    if (isAnnouncedEvent && (!eventDate || !eventStartTime || !eventEndTime)) { announce('For an announced event, enter its date, start time and end time.', 'error'); return; }
    if (isAnnouncedEvent && eventEndTime <= eventStartTime) { announce('The event end time must be later than its start time.', 'error'); return; }
    const resource: Resource = {
      id: makeId('r'), title, category: String(form.get('category') || 'Online Materials'), region: String(form.get('region') || currentUser.region), city: String(form.get('city') || 'Not specified'), organization: String(form.get('organization') || currentUser.schoolOrOrganization),
      shortDescription: String(form.get('shortDescription') || description.slice(0, 120)), description,
      cost: String(form.get('cost') || 'Free') as Resource['cost'], mode: String(form.get('mode') || 'Online') as Resource['mode'],
      subjects: String(form.get('subjects') || '').split(',').map((item) => item.trim()).filter(Boolean), audience: String(form.get('audience') || 'All learners').split(',').map((item) => item.trim()).filter(Boolean),
      accessSteps: String(form.get('accessSteps') || '').split('\n').map((item) => item.trim()).filter(Boolean), schedule: String(form.get('schedule') || 'Confirm with the provider before visiting.'),
      amenities: String(form.get('amenities') || '').split(',').map((item) => item.trim()).filter(Boolean), contactNotes: String(form.get('contactNotes') || 'Please verify access details with the provider.'), website: String(form.get('website') || '').trim(),
      contactMethod: String(form.get('contactMethod') || 'EduLoop chat') as Resource['contactMethod'], contactInfo: String(form.get('contactInfo') || '').trim(),
      isAnnouncedEvent, eventDate: isAnnouncedEvent ? eventDate : undefined, eventStartTime: isAnnouncedEvent ? eventStartTime : undefined, eventEndTime: isAnnouncedEvent ? eventEndTime : undefined,
      createdBy: currentUser.id, createdByName: currentUser.name, status: 'Pending Review', createdAt: new Date().toISOString(), icon: 'BookOpen', color: 'mint',
    };
    updateApp((previous) => ({ ...previous, resources: [resource, ...previous.resources], notifications: [...previous.notifications, addNotification('u-lea', 'Resource submitted for review', `${currentUser.name} submitted “${resource.title}” for approval.`)], activity: [logActivity(`${currentUser.name} submitted resource “${resource.title}” for review.`), ...previous.activity].slice(0, 40) }));
    (event.target as HTMLFormElement).reset(); announce('Resource submitted. It will appear publicly after an administrator reviews it.'); navigate('/dashboard');
  };

  const submitMaterial = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const description = String(form.get('description') || '').trim();
    if (title.length < 3 || description.length < 20) { announce('Add a title and a more detailed description (at least 20 characters).', 'error'); return; }
    const material: Material = {
      id: makeId('m'), title, category: String(form.get('category') || 'School Supplies'), condition: String(form.get('condition') || 'Good') as Material['condition'], exchangeType: String(form.get('exchangeType') || 'Donate') as Material['exchangeType'],
      region: String(form.get('region') || currentUser.region), city: String(form.get('city') || 'Not specified'), description, includedItems: String(form.get('includedItems') || '').split(',').map((item) => item.trim()).filter(Boolean),
      pickupNotes: String(form.get('pickupNotes') || 'Arrange a safe public handoff privately after approval.'), contactMethod: String(form.get('contactMethod') || 'EduLoop chat') as Material['contactMethod'], contactInfo: String(form.get('contactInfo') || '').trim(), availability: 'Available', ownerId: currentUser.id, ownerName: currentUser.name, ownerRole: currentUser.role, status: 'Pending Review', createdAt: new Date().toISOString(), icon: 'Package', color: 'mint',
    };
    updateApp((previous) => ({ ...previous, materials: [material, ...previous.materials], notifications: [...previous.notifications, addNotification('u-lea', 'Material listing submitted', `${currentUser.name} submitted “${material.title}” for review.`)], activity: [logActivity(`${currentUser.name} listed “${material.title}” for review.`), ...previous.activity].slice(0, 40) }));
    (event.target as HTMLFormElement).reset(); announce('Material listing submitted for review.'); navigate('/dashboard');
  };

  const sendRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !requestMaterial) return;
    if (requestMaterial.ownerId === currentUser.id) { announce('You cannot request your own listing.', 'error'); setRequestMaterial(null); return; }
    if (requestMaterial.availability !== 'Available') { announce('This item is no longer available.', 'error'); setRequestMaterial(null); return; }
    const alreadyRequested = app.requests.some((request) => request.materialId === requestMaterial.id && request.requesterId === currentUser.id && ['Pending', 'Approved'].includes(request.status));
    if (alreadyRequested) { announce('You already have an active request for this item.', 'error'); setRequestMaterial(null); return; }
    const request: RequestRecord = { id: makeId('q'), materialId: requestMaterial.id, materialTitle: requestMaterial.title, requesterId: currentUser.id, requesterName: currentUser.name, ownerId: requestMaterial.ownerId, ownerName: requestMaterial.ownerName, message: requestMessage.trim() || 'I am interested in this learning material. Please let me know if it is still available.', status: 'Pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    updateApp((previous) => ({ ...previous, requests: [request, ...previous.requests], notifications: [...previous.notifications, addNotification(requestMaterial.ownerId, 'New material request', `${currentUser.name} requested “${requestMaterial.title}”.`), addNotification(currentUser.id, 'Request sent', `Your request for “${requestMaterial.title}” is now pending.`)], activity: [logActivity(`${currentUser.name} requested “${requestMaterial.title}”.`), ...previous.activity].slice(0, 40) }));
    setRequestMaterial(null); setRequestMessage(''); announce('Your request was sent. Check My Requests for updates.'); navigate('/requests');
  };

  const changeRequestStatus = (requestId: string, status: RequestStatus) => {
    const request = app.requests.find((item) => item.id === requestId);
    if (!request || !currentUser) return;
    if (status === 'Approved' && request.requesterId === currentUser.id) { announce('Only the listing owner can approve a request.', 'error'); return; }
    if (status === 'Cancelled' && request.requesterId !== currentUser.id) { announce('Only the requester can cancel this request.', 'error'); return; }
    updateApp((previous) => {
      const updated = previous.requests.map((item) => item.id === requestId ? { ...item, status, updatedAt: new Date().toISOString() } : item);
      let materials = previous.materials;
      if (status === 'Completed') materials = materials.map((item) => item.id === request.materialId ? { ...item, availability: 'Unavailable' } : item);
      const targetUser = status === 'Cancelled' ? request.ownerId : (currentUser.id === request.ownerId ? request.requesterId : request.ownerId);
      const message = status === 'Approved' ? `Your request for “${request.materialTitle}” was approved.` : status === 'Rejected' ? `Your request for “${request.materialTitle}” was declined.` : status === 'Completed' ? `The exchange for “${request.materialTitle}” was marked complete.` : status === 'Cancelled' ? `${request.requesterName} cancelled the request for “${request.materialTitle}”.` : `The request for “${request.materialTitle}” was updated to ${status.toLowerCase()}.`;
      return { ...previous, requests: updated, materials, notifications: [...previous.notifications, addNotification(targetUser, `Request ${status.toLowerCase()}`, message)], activity: [logActivity(`${currentUser.name} marked request for “${request.materialTitle}” as ${status}.`), ...previous.activity].slice(0, 40) };
    });
    announce(`Request marked ${status.toLowerCase()}.`);
  };

  const toggleMaterialAvailability = (materialId: string) => {
    if (!currentUser) return;
    const material = app.materials.find((item) => item.id === materialId);
    if (!material || material.ownerId !== currentUser.id) return;
    updateApp((previous) => ({ ...previous, materials: previous.materials.map((item) => item.id === materialId ? { ...item, availability: item.availability === 'Available' ? 'Unavailable' : 'Available' } : item), activity: [logActivity(`${currentUser.name} updated availability for “${material.title}”.`), ...previous.activity].slice(0, 40) }));
    announce('Listing availability updated.');
  };

  const toggleSavedResource = (resourceId: string) => {
    if (!currentUser) return;
    const alreadySaved = (app.savedItems?.[currentUser.id] || []).includes(resourceId);
    updateApp((previous) => {
      const current = previous.savedItems || {};
      const saved = current[currentUser.id] || [];
      const nextSaved = saved.includes(resourceId) ? saved.filter((id) => id !== resourceId) : [resourceId, ...saved];
      return { ...previous, savedItems: { ...current, [currentUser.id]: nextSaved }, activity: [logActivity(`${currentUser.name} ${saved.includes(resourceId) ? 'removed a resource from' : 'saved a resource to'} their shortlist.`), ...previous.activity].slice(0, 40) };
    });
    announce(alreadySaved ? 'Resource removed from your saved list.' : 'Resource saved to your dashboard.');
  };

  const adminReview = (id: string, type: 'Resource' | 'Material', status: 'Approved' | 'Rejected', reason = '') => {
    if (!isAdmin) { announce('Administrator access is required.', 'error'); return; }
    updateApp((previous) => {
      let resources = previous.resources; let materials = previous.materials;
      let title = 'listing'; let ownerId: string | null = null; let ownerName = 'A community member';
      if (type === 'Resource') {
        const target = previous.resources.find((item) => item.id === id);
        if (target) { title = target.title; ownerId = target.createdBy; ownerName = target.createdByName; }
        resources = previous.resources.map((item) => item.id === id ? { ...item, status } : item);
      } else {
        const target = previous.materials.find((item) => item.id === id);
        if (target) { title = target.title; ownerId = target.ownerId; ownerName = target.ownerName; }
        materials = previous.materials.map((item) => item.id === id ? { ...item, status } : item);
      }
      const decision = status === 'Approved' ? 'approved' : 'rejected';
      return { ...previous, resources, materials, notifications: ownerId ? [...previous.notifications, addNotification(ownerId, `${type} ${decision}`, `Your ${type.toLowerCase()} “${title}” was ${decision}.${reason ? ` Reason: ${reason}` : ''}`)] : previous.notifications, activity: [logActivity(`Admin ${currentUser?.name || 'reviewer'} ${decision} ${type.toLowerCase()} “${title}”.${reason ? ` Reason: ${reason}` : ''}`), ...previous.activity].slice(0, 40) };
    });
    setRejectTarget(null); setRejectReason(''); announce(`${type} ${status.toLowerCase()}.`);
  };

  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reportDetails) return;
    updateApp((previous) => ({ ...previous, reports: [{ id: makeId('rep'), targetType: reportDetails.type, targetId: reportDetails.id, targetTitle: reportDetails.title, reason: reportReason, details: reportText.trim(), reporterName: currentUser?.name || 'Guest visitor', status: 'Open', createdAt: new Date().toISOString() }, ...previous.reports], activity: [logActivity(`${currentUser?.name || 'Guest visitor'} reported ${reportDetails.type.toLowerCase()} “${reportDetails.title}”.`), ...previous.activity].slice(0, 40) }));
    setReportDetails(null); setReportText(''); announce('Thank you. The listing report was sent for review.');
  };

  const markNotificationRead = (notificationId: string) => updateApp((previous) => ({ ...previous, notifications: previous.notifications.map((item) => item.id === notificationId && item.userId === currentUser?.id ? { ...item, read: true } : item) }));
  const markAllRead = () => updateApp((previous) => ({ ...previous, notifications: previous.notifications.map((item) => item.userId === currentUser?.id ? { ...item, read: true } : item) }));
  const clearRead = () => updateApp((previous) => ({ ...previous, notifications: previous.notifications.filter((item) => item.userId !== currentUser?.id || !item.read) }));

  const addCalendarEntry = (resource: Resource) => {
    if (!currentUser) { setAuthMode('login'); setAuthError('Log in to add an announced event to your calendar.'); return; }
    if (!resource.isAnnouncedEvent || !resource.eventDate || !resource.eventStartTime || !resource.eventEndTime) {
      announce('Only announced events with a confirmed date and time can be added.', 'error'); return;
    }
    if (calendarEntries.some((entry) => entry.userId === currentUser.id && entry.resourceId === resource.id)) {
      announce('This event is already in your calendar.', 'info'); return;
    }
    const entry: CalendarEntry = { id: makeId('cal'), userId: currentUser.id, resourceId: resource.id, title: resource.title, date: resource.eventDate, startTime: resource.eventStartTime, endTime: resource.eventEndTime, location: resource.city, provider: resource.organization };
    setCalendarEntries((previous) => [...previous, entry]);
    announce('Added to your dashboard calendar.');
  };
  const removeCalendarEntry = (entryId: string) => {
    setCalendarEntries((previous) => previous.filter((entry) => entry.id !== entryId));
    announce('Event removed from your calendar.', 'info');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/resources', label: 'Learning resources', icon: BookOpen },
    { path: '/materials', label: 'Materials exchange', icon: Package },
    { path: '/about', label: 'About', icon: Info },
  ];
  const activeTab = route === '/' ? 'Home' : route.startsWith('/resources') ? 'Learning resources' : route.startsWith('/materials') ? 'Materials exchange' : route.startsWith('/about') ? 'About' : '';

  const resourceDetailMatch = route.match(/^\/resources\/([^/]+)$/);
  const materialDetailMatch = route.match(/^\/materials\/([^/]+)$/);
  const detailResource = resourceDetailMatch ? app.resources.find((item) => item.id === resourceDetailMatch[1] && (item.status === 'Approved' || item.createdBy === currentUser?.id || isAdmin)) : undefined;
  const detailMaterial = materialDetailMatch ? app.materials.find((item) => item.id === materialDetailMatch[1] && (item.status === 'Approved' || item.ownerId === currentUser?.id || isAdmin)) : undefined;

  const renderResourceCard = (resource: Resource) => (
    <article className="listing-card resource-card" key={resource.id}>
      <div className={`listing-art art-${resource.color}`}><span className="art-orbit" /><div className="art-icon"><TileIcon name={resource.icon} size={30} /></div><span className="art-tag">{resource.category}</span></div>
      <div className="listing-content">
        <div className="listing-meta"><span><MapPin size={13} /> {resource.city}</span><span className="meta-dot">·</span><span>{resource.mode}</span></div>
        <h3>{resource.title}</h3><p>{resource.shortDescription}</p>
        <div className="tag-row"><span className={`pill pill-${resource.cost === 'Free' ? 'green' : 'blue'}`}>{resource.cost}</span><span className="pill pill-light">{resource.region}</span></div>
        <div className="resource-owner-contact"><span className="avatar avatar-tiny">{initials(resource.createdByName)}</span><span>Posted by <strong>{resource.createdByName}</strong></span><span className="resource-contact-method"><MessageCircle size={12} /> {resource.contactMethod || 'EduLoop chat'}</span></div>
        <div className="resource-card-actions"><button className="text-link" onClick={() => navigate(`/resources/${resource.id}`)}>View resource details <ArrowRight size={15} /></button>{resource.isAnnouncedEvent && resource.eventDate && resource.eventStartTime && resource.eventEndTime && <button className="btn btn-soft btn-sm" disabled={Boolean(currentUser && calendarEntries.some((entry) => entry.userId === currentUser.id && entry.resourceId === resource.id))} onClick={() => addCalendarEntry(resource)}><CalendarDays size={14} /> {currentUser && calendarEntries.some((entry) => entry.userId === currentUser.id && entry.resourceId === resource.id) ? 'Added to calendar' : 'Add to calendar'}</button>}</div>
      </div>
    </article>
  );

  const renderMaterialCard = (material: Material) => {
    const own = currentUser?.id === material.ownerId;
    return <article className="listing-card material-card" key={material.id}>
      <div className={`listing-art art-${material.color}`}><span className="art-orbit" /><div className="art-icon"><TileIcon name={material.icon} size={31} /></div><span className="art-tag">{material.exchangeType}</span></div>
      <div className="listing-content">
        <div className="listing-meta"><span><MapPin size={13} /> {material.city}</span><span className="meta-dot">·</span><span>{material.condition}</span></div>
        <h3>{material.title}</h3><p>{material.description}</p>
        <div className="tag-row"><span className={`pill ${material.availability === 'Available' ? 'pill-green' : material.availability === 'Reserved' ? 'pill-yellow' : 'pill-gray'}`}>{material.availability}</span><span className="pill pill-light">{material.category}</span></div>
        <div className="material-contact-mini"><MessageCircle size={13} /><span>Contact via <strong>{material.contactMethod || 'EduLoop chat'}</strong></span></div>
        <div className="card-foot"><span className="owner-mini"><span className="avatar avatar-tiny">{initials(material.ownerName)}</span> {own ? 'Your listing' : material.ownerName}</span><div className="material-card-actions">{!own && <button className="btn btn-outline btn-sm" onClick={() => requireUser(() => setChatTarget({ listingId: material.id, listingTitle: material.title, listingType: 'Material', recipientId: material.ownerId, recipientName: material.ownerName }))}><MessageCircle size={13} /> Message</button>}<button className="text-link" onClick={() => navigate(`/materials/${material.id}`)}>Details <ArrowRight size={15} /></button></div></div>
      </div>
    </article>;
  };

  const renderHome = () => {
    const featuredResources = approvedResources.filter((item) => item.featured).slice(0, 3);
    const featuredMaterials = approvedMaterials.filter((item) => item.availability === 'Available').slice(0, 3);
    return <>
      <section className="hero">
        <div className="hero-bg-shape hero-shape-one" /><div className="hero-bg-shape hero-shape-two" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light"><Sparkles size={14} /> A community-powered learning network</span>
            <h1>Learning gets better<br />when we <em>share.</em></h1>
            <p>Discover study spaces, learning guides and peer support. Pass useful school materials to the next learner who needs them.</p>
            <div className="hero-actions"><button className="btn btn-lime" onClick={() => navigate('/resources')}>Explore learning resources <ArrowRight size={17} /></button><button className="btn btn-ghost-light" onClick={() => navigate('/materials')}>Browse shared materials</button></div>
            <div className="hero-trust"><div className="avatar-stack"><span className="avatar avatar-a">MS</span><span className="avatar avatar-b">PR</span><span className="avatar avatar-c">LC</span></div><span><strong>Small acts. Bigger opportunities.</strong><br /><small>Built around access, reuse and community support</small></span></div>
          </div>
          <div className="hero-visual" aria-label="Illustration representing shared learning resources">
            <div className="hero-sun" /><div className="float-note note-one"><BookOpen size={20} /><span>Find a place<br /><strong>to learn</strong></span></div>
            <div className="hero-book book-back"><span /><span /><span /></div><div className="hero-book book-front"><div className="book-circle"><Sparkles size={22} /></div><b>GOOD IDEAS<br />GROW HERE</b><small>EDULOOP • PH</small></div>
            <div className="hero-pencil"><span /></div><div className="float-note note-two"><HandHeart size={20} /><span>Give it another<br /><strong>school day</strong></span></div>
            <div className="hero-doodle doodle-one">✳</div><div className="hero-doodle doodle-two">✦</div><div className="hero-doodle doodle-three">· · ·</div>
          </div>
        </div>
        <div className="hero-bottom-line"><span>SDG 4</span><span>QUALITY EDUCATION</span><span>OPEN DOOR · CLASSCYCLE</span></div>
      </section>

      <section className="stats-band wrap">
        <div className="stat-item"><span className="stat-icon stat-mint"><BookOpen size={20} /></span><div><strong>{approvedResources.length}</strong><span>learning resources</span></div></div>
        <div className="stat-item"><span className="stat-icon stat-peach"><Package size={20} /></span><div><strong>{approvedMaterials.length}</strong><span>materials listed</span></div></div>
        <div className="stat-item"><span className="stat-icon stat-lavender"><MapPin size={20} /></span><div><strong>17</strong><span>Philippine regions to explore</span></div></div>
        <div className="stat-note"><span className="live-dot" /> <span>Fictional sample listings<br /><b>for a working class prototype</b></span></div>
      </section>

      <section className="section wrap section-intro">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> HOW EDULOOP WORKS</span><h2>Two ways to make<br />learning more reachable.</h2></div><p>Sometimes the resource already exists. The hard part is knowing where to find it—or finding someone who can share it.</p></div>
        <div className="feature-grid">
          <article className="feature-card feature-opendoor"><div className="feature-graphic graphic-door"><div className="door-frame"><div className="door-inner"><span className="door-knob" /></div></div><div className="sun-stamp">OPEN<br />DOOR</div><span className="graphic-star">✳</span></div><div className="feature-body"><div className="feature-title"><span className="feature-number">01</span><h3>OpenDoor</h3></div><p>Find libraries, study areas, tutoring support and useful online materials—organized with details that help you decide what fits.</p><button className="text-link" onClick={() => navigate('/resources')}>Explore resources <ArrowRight size={15} /></button></div></article>
          <article className="feature-card feature-cycle"><div className="feature-graphic graphic-cycle"><div className="cycle-box box-one"><BookOpen size={28} /></div><div className="cycle-box box-two"><Calculator size={27} /></div><div className="cycle-box box-three"><PencilRuler size={26} /></div><div className="cycle-loop"><ArrowDownRight size={25} /></div><span className="cycle-spark">✦</span></div><div className="feature-body"><div className="feature-title"><span className="feature-number">02</span><h3>ClassCycle</h3></div><p>Borrow, donate or swap textbooks, calculators and school supplies so useful materials can support more than one learner.</p><button className="text-link" onClick={() => navigate('/materials')}>Browse materials <ArrowRight size={15} /></button></div></article>
        </div>
      </section>

      <section className="section featured-section"><div className="wrap"><div className="section-heading section-heading-compact"><div><span className="eyebrow"><span className="eyebrow-line" /> START EXPLORING</span><h2>Helpful places, ideas<br />and things to share.</h2></div><button className="btn btn-outline" onClick={() => navigate('/resources')}>All learning resources <ArrowRight size={16} /></button></div><div className="card-grid">{featuredResources.map(renderResourceCard)}</div></div></section>

      <section className="section wrap"><div className="section-heading section-heading-compact"><div><span className="eyebrow"><span className="eyebrow-line" /> PASS IT FORWARD</span><h2>School essentials deserve<br />a second chapter.</h2></div><button className="btn btn-outline" onClick={() => navigate('/materials')}>All shared materials <ArrowRight size={16} /></button></div><div className="card-grid">{featuredMaterials.map(renderMaterialCard)}</div></section>

      <section className="join-banner wrap"><div className="join-icon"><Users size={27} /></div><div><span className="eyebrow eyebrow-light">BE PART OF THE LOOP</span><h2>Learning resources work harder<br />when a community shares them.</h2><p>Create an account to make requests, share materials or submit a learning resource.</p></div><button className="btn btn-lime" onClick={() => { setAuthMode('register'); setAuthError(''); }}>Join EduLoop <ArrowRight size={17} /></button><div className="join-decoration">✳</div></section>
      <PrototypeNotice />
    </>;
  };

  const renderResources = () => <section className="page-shell wrap">
    <div className="page-hero page-hero-green"><div><span className="eyebrow"><BookOpen size={14} /> OPENDOOR DIRECTORY</span><h1>Find your next<br /><em>learning resource.</em></h1><p>Search for study spaces, libraries, tutoring and online materials across the Philippines.</p></div><div className="page-hero-illustration resource-hero-art"><div className="hero-art-circle"><Library size={50} /></div><span className="hero-art-book book-a"/><span className="hero-art-book book-b"/><span className="hero-art-book book-c"/><span className="hero-art-spark">✦</span></div></div>
    <div className="results-topline"><div><span className="eyebrow"><span className="eyebrow-line" /> EXPLORE THE DIRECTORY</span><h2>Resources for real study needs</h2></div><button className="btn btn-soft" onClick={() => requireUser(() => navigate('/submit-resource'))}><Plus size={16} /> Submit a resource</button></div>
    <div className="filter-panel"><div className="search-input"><Search size={18} /><input value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder="Search by topic, place or resource name" aria-label="Search learning resources" /></div><div className="filter-controls"><label><span>Type</span><select value={resourceCategory} onChange={(event) => setResourceCategory(event.target.value)}><option>All categories</option>{resourceCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Region</span><select value={resourceRegion} onChange={(event) => setResourceRegion(event.target.value)}><option>All regions</option>{philippineRegions.map((region) => <option key={region}>{region}</option>)}</select></label><label><span>Cost</span><select value={resourceCost} onChange={(event) => setResourceCost(event.target.value)}><option>Any cost</option><option>Free</option><option>Low-cost</option><option>Varies</option></select></label><label><span>Learning mode</span><select value={resourceMode} onChange={(event) => setResourceMode(event.target.value)}><option>Any mode</option><option>Online</option><option>In person</option><option>Hybrid</option></select></label><button className="clear-filter" onClick={clearResourceFilters}><X size={14} /> Clear</button></div></div>
    <div className="result-count"><span><strong>{filteredResources.length}</strong> resources found</span><span><Filter size={14} /> Filters combine to narrow results</span></div>
    {filteredResources.length ? <div className="card-grid card-grid-wide">{filteredResources.map(renderResourceCard)}</div> : <EmptyState icon={Search} title="No resources match those filters" text="Try removing a filter or searching for a broader topic." action="Clear filters" onAction={clearResourceFilters} />}
    <PrototypeNotice />
  </section>;

  const renderMaterials = () => <section className="page-shell wrap">
    <div className="page-hero page-hero-peach"><div><span className="eyebrow"><Package size={14} /> CLASSCYCLE EXCHANGE</span><h1>Useful things.<br /><em>More than one owner.</em></h1><p>Find school supplies shared by students and community contributors. Request, borrow, donate or swap—with clear expectations.</p></div><div className="page-hero-illustration material-hero-art"><div className="material-stack stack-book"><BookOpen size={33} /></div><div className="material-stack stack-calc"><Calculator size={30} /></div><div className="material-stack stack-pencil"><PencilRuler size={28} /></div><div className="material-heart"><HeartHandshake size={28} /></div><span className="hero-art-spark">✦</span></div></div>
    <div className="results-topline"><div><span className="eyebrow"><span className="eyebrow-line" /> CIRCULAR LEARNING</span><h2>Materials ready for their next learner</h2></div><button className="btn btn-soft" onClick={() => requireUser(() => navigate('/add-material'))}><Plus size={16} /> List a material</button></div>
    <div className="filter-panel"><div className="search-input"><Search size={18} /><input value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} placeholder="Search textbooks, calculators, supplies..." aria-label="Search materials" /></div><div className="filter-controls"><label><span>Category</span><select value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value)}><option>All categories</option>{materialCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Region</span><select value={materialRegion} onChange={(event) => setMaterialRegion(event.target.value)}><option>All regions</option>{philippineRegions.map((region) => <option key={region}>{region}</option>)}</select></label><label><span>Exchange type</span><select value={materialType} onChange={(event) => setMaterialType(event.target.value)}><option>Any exchange</option><option>Donate</option><option>Borrow</option><option>Swap</option></select></label><label><span>Condition</span><select value={materialCondition} onChange={(event) => setMaterialCondition(event.target.value)}><option>Any condition</option><option>New</option><option>Like new</option><option>Good</option><option>Well-used</option></select></label><button className="clear-filter" onClick={clearMaterialFilters}><X size={14} /> Clear</button></div></div>
    <div className="result-count"><span><strong>{filteredMaterials.length}</strong> materials found</span><span><Filter size={14} /> Only approved public listings are shown</span></div>
    {filteredMaterials.length ? <div className="card-grid card-grid-wide">{filteredMaterials.map(renderMaterialCard)}</div> : <EmptyState icon={Package} title="No materials match those filters" text="Try clearing a filter, or check back later as the community adds more." action="Clear filters" onAction={clearMaterialFilters} />}
    <PrototypeNotice />
  </section>;

  const renderResourceDetail = (resource: Resource) => <section className="wrap detail-shell">
    <button className="back-link" onClick={() => navigate('/resources')}><ArrowLeft size={16} /> Back to learning resources</button>
    <div className="detail-layout"><div className={`detail-art art-${resource.color}`}><span className="art-orbit" /><div className="detail-art-icon"><TileIcon name={resource.icon} size={68} /></div><span className="art-tag">{resource.category}</span><div className="detail-art-note"><Sparkles size={15} /> Resource spotlight</div></div>
      <div className="detail-main"><div className="tag-row"><span className={`pill ${resource.cost === 'Free' ? 'pill-green' : 'pill-blue'}`}>{resource.cost}</span><span className="pill pill-light">{resource.mode}</span>{resource.status !== 'Approved' && <span className="pill pill-yellow">{resource.status}</span>}</div><h1>{resource.title}</h1><p className="detail-lead">{resource.shortDescription}</p><div className="detail-meta-grid"><div><span><MapPin size={15} /> Location</span><strong>{resource.city}</strong><small>{resource.region}</small></div><div><span><School size={15} /> Provider</span><strong>{resource.organization}</strong><small>Listed by {resource.createdByName}</small></div><div><span><CalendarDays size={15} /> Schedule</span><strong>{resource.schedule}</strong><small>Confirm details before travelling</small></div></div>
        <div className="detail-actions"><button className="btn btn-primary" onClick={() => { if (resource.website) window.open(resource.website, '_blank', 'noopener,noreferrer'); else announce('This demo listing has no verified external link. Confirm contact details with a real provider before visiting.', 'info'); }}><ExternalLink size={16} /> {resource.website ? 'Open provider link' : 'View access guidance'}</button><button className="btn btn-outline" onClick={() => requireUser(() => toggleSavedResource(resource.id))}><Bookmark size={16} /> {(currentUser && (app.savedItems?.[currentUser.id] || []).includes(resource.id)) ? 'Saved to dashboard' : 'Save resource'}</button>{resource.createdBy !== currentUser?.id && <button className="btn btn-outline" onClick={() => requireUser(() => setChatTarget({ listingId: resource.id, listingTitle: resource.title, listingType: 'Resource', recipientId: resource.createdBy, recipientName: resource.createdByName }))}><MessageCircle size={16} /> Message provider</button>}{resource.isAnnouncedEvent && resource.eventDate && resource.eventStartTime && resource.eventEndTime && <button className="btn btn-soft" disabled={Boolean(currentUser && calendarEntries.some((entry) => entry.userId === currentUser.id && entry.resourceId === resource.id))} onClick={() => addCalendarEntry(resource)}><CalendarDays size={16} /> {currentUser && calendarEntries.some((entry) => entry.userId === currentUser.id && entry.resourceId === resource.id) ? 'Added to calendar' : 'Add to calendar'}</button>}<button className="icon-button icon-button-small" aria-label="Report resource" onClick={() => setReportDetails({ title: resource.title, type: 'Resource', id: resource.id })}><MessageSquareWarning size={16} /></button></div>
      </div></div>
    <div className="detail-sections"><article className="detail-panel detail-overview"><span className="eyebrow"><span className="eyebrow-line" /> OVERVIEW</span><h2>What you can expect</h2><p>{resource.description}</p><h3>Subjects and support</h3><div className="tag-row">{resource.subjects.map((subject) => <span key={subject} className="pill pill-light">{subject}</span>)}</div><h3>Who this may help</h3><p>{resource.audience.join(', ')}.</p></article>
      <article className="detail-panel"><div className="panel-heading"><span className="panel-icon panel-icon-green"><CheckCircle2 size={19} /></span><div><h3>How to access</h3><p>Recommended next steps</p></div></div><ol className="step-list">{resource.accessSteps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></article>
      <article className="detail-panel"><div className="panel-heading"><span className="panel-icon panel-icon-blue"><Sparkles size={19} /></span><div><h3>Available support</h3><p>Features and amenities</p></div></div><ul className="check-list">{resource.amenities.map((item) => <li key={item}><Check size={15} /> {item}</li>)}</ul><div className="note-box"><CircleHelp size={17} /><p>{resource.contactNotes}</p></div></article>
      <article className="detail-panel"><div className="panel-heading"><span className="panel-icon panel-icon-peach"><MessageCircle size={19} /></span><div><h3>Contact the provider</h3><p>Ask about this resource</p></div></div><div className="profile-summary"><span className="avatar avatar-large">{initials(resource.createdByName)}</span><div><strong>{resource.createdByName}</strong><span>{resource.organization}</span><small>Preferred contact: {resource.contactMethod || 'EduLoop chat'}</small></div></div>{resource.contactInfo && <p className="contact-public-info">{resource.contactInfo}</p>}{resource.createdBy !== currentUser?.id && <button className="btn btn-primary btn-block" onClick={() => requireUser(() => setChatTarget({ listingId: resource.id, listingTitle: resource.title, listingType: 'Resource', recipientId: resource.createdBy, recipientName: resource.createdByName }))}><MessageCircle size={16} /> Message provider</button>}<p className="muted-copy">Use published organizational contact details only. Do not share private addresses or sensitive information.</p></article>
    </div><div className="safety-strip"><ShieldCheck size={20} /><p><strong>Before you go:</strong> This is a fictional classroom-demo listing. Verify the provider, opening hours, fees and accessibility details directly before travelling or sharing personal information.</p></div>
  </section>;

  const renderMaterialDetail = (material: Material) => {
    const own = material.ownerId === currentUser?.id;
    const activeRequest = currentUser ? app.requests.find((request) => request.materialId === material.id && request.requesterId === currentUser.id && ['Pending', 'Approved'].includes(request.status)) : undefined;
    return <section className="wrap detail-shell">
      <button className="back-link" onClick={() => navigate('/materials')}><ArrowLeft size={16} /> Back to materials exchange</button>
      <div className="detail-layout"><div className={`detail-art art-${material.color}`}><span className="art-orbit" /><div className="detail-art-icon"><TileIcon name={material.icon} size={68} /></div><span className="art-tag">{material.exchangeType}</span><div className="detail-art-note"><HeartHandshake size={15} /> Shared for learning</div></div>
        <div className="detail-main"><div className="tag-row"><span className={`pill ${material.availability === 'Available' ? 'pill-green' : material.availability === 'Reserved' ? 'pill-yellow' : 'pill-gray'}`}>{material.availability}</span><span className="pill pill-light">{material.condition} condition</span><span className="pill pill-light">{material.category}</span></div><h1>{material.title}</h1><p className="detail-lead">{material.description}</p><div className="detail-meta-grid"><div><span><MapPin size={15} /> Location</span><strong>{material.city}</strong><small>{material.region}</small></div><div><span><HandHeart size={15} /> Shared by</span><strong>{material.ownerName}</strong><small>{material.ownerRole}</small></div><div><span><CalendarDays size={15} /> Listed</span><strong>{dateLabel(material.createdAt)}</strong><small>Availability can change</small></div></div>
          <div className="detail-actions">{own ? <button className="btn btn-primary" onClick={() => toggleMaterialAvailability(material.id)}><Settings2 size={16} /> Mark {material.availability === 'Available' ? 'unavailable' : 'available'}</button> : material.availability === 'Available' ? <button className="btn btn-primary" onClick={() => requireUser(() => { setRequestMessage(''); setRequestMaterial(material); })}><Send size={16} /> Request this material</button> : <button className="btn btn-disabled" disabled>Currently unavailable</button>}{activeRequest && <span className="inline-status"><Clock3 size={14} /> Request {activeRequest.status.toLowerCase()}</span>}{!own && <button className="btn btn-outline" onClick={() => requireUser(() => setChatTarget({ listingId: material.id, listingTitle: material.title, listingType: 'Material', recipientId: material.ownerId, recipientName: material.ownerName }))}><MessageCircle size={16} /> Message poster</button>}<button className="icon-button icon-button-small" aria-label="Report material" onClick={() => setReportDetails({ title: material.title, type: 'Material', id: material.id })}><MessageSquareWarning size={16} /></button></div>
        </div></div>
      <div className="detail-sections"><article className="detail-panel detail-overview"><span className="eyebrow"><span className="eyebrow-line" /> ITEM DETAILS</span><h2>What is included?</h2><p>{material.description}</p><ul className="check-list">{material.includedItems.map((item) => <li key={item}><Check size={15} /> {item}</li>)}</ul><h3>Exchange type</h3><p><strong>{material.exchangeType}</strong> — {material.exchangeType === 'Donate' ? 'the contributor plans to give the material to another learner.' : material.exchangeType === 'Borrow' ? 'the owner expects the item to be returned at an agreed time.' : 'both parties should agree on fair, usable items before exchanging.'}</p></article>
        <article className="detail-panel"><div className="panel-heading"><span className="panel-icon panel-icon-green"><MapPin size={19} /></span><div><h3>Pickup and handoff</h3><p>Keep coordination safe and clear</p></div></div><p>{material.pickupNotes}</p><div className="note-box"><ShieldCheck size={17} /><p>Use a public, mutually agreed pickup place. Do not publish your home address, private schedule or account passwords in a public listing.</p></div></article>
        <article className="detail-panel"><div className="panel-heading"><span className="panel-icon panel-icon-peach"><UserRound size={19} /></span><div><h3>About the contributor</h3><p>Community member</p></div></div><div className="profile-summary"><span className="avatar avatar-large">{initials(material.ownerName)}</span><div><strong>{material.ownerName}</strong><span>{material.ownerRole}</span><small>Sharing materials to support access to learning</small></div></div><div className="listing-contact-details"><strong>Contact options</strong><span>{material.contactMethod || 'EduLoop chat'}</span>{material.contactInfo && <span className="contact-public-info">{material.contactInfo}</span>}{!material.contactInfo && <small>Use “Message poster” to ask about availability or pickup.</small>}</div><p className="muted-copy">EduLoop does not verify the identity of demo users. Use public organizational contact details only; keep private phone numbers and home addresses out of listings.</p></article>
      </div><div className="safety-strip"><ShieldCheck size={20} /><p><strong>Community reminder:</strong> A request is not a confirmed exchange. Wait for the owner’s response and agree on details before travelling or handing over an item.</p></div>
    </section>;
  };

  const renderDashboard = () => {
    if (!currentUser) return <SignInPrompt onLogin={() => { setAuthMode('login'); setAuthError(''); }} onRegister={() => { setAuthMode('register'); setAuthError(''); }} />;
    const made = app.requests.filter((request) => request.requesterId === currentUser.id);
    const received = app.requests.filter((request) => request.ownerId === currentUser.id);
    const ownedMaterials = app.materials.filter((material) => material.ownerId === currentUser.id);
    const ownedResources = app.resources.filter((resource) => resource.createdBy === currentUser.id);
    const recentIds = app.recentlyViewed[currentUser.id] || [];
    const recentlyViewed = recentIds.map((id) => app.resources.find((r) => r.id === id) || app.materials.find((m) => m.id === id)).filter((item): item is Resource | Material => Boolean(item));
    const savedResources = (app.savedItems?.[currentUser.id] || []).map((id) => app.resources.find((resource) => resource.id === id)).filter((item): item is Resource => item !== undefined && item.status === 'Approved');
    const personalNotifications = app.notifications.filter((item) => item.userId === currentUser.id).slice(0, 3);
    const pendingCount = made.concat(received).filter((request) => request.status === 'Pending').length;
    return <section className="wrap dashboard-shell"><div className="dashboard-welcome"><div><span className="eyebrow"><span className="eyebrow-line" /> YOUR EDULOOP SPACE</span><h1>Welcome back,<br /><em>{currentUser.name.split(' ')[0]}.</em></h1><p>Here’s a quick look at your learning activity and community connections.</p><div className="role-line"><span className={`role-dot role-${currentUser.role.toLowerCase()}`} /> {currentUser.role} <span>·</span> {currentUser.region}</div></div><div className="welcome-art"><div className="welcome-art-circle"><User size={38} /></div><span className="welcome-art-star">✦</span><span className="welcome-art-dot" /></div></div>
      <div className="dashboard-metrics"><Metric icon={Send} label="Requests made" value={made.length} color="mint" /><Metric icon={Clock3} label="Waiting for a response" value={pendingCount} color="peach" /><Metric icon={Package} label="Your material listings" value={ownedMaterials.length} color="lavender" /><Metric icon={BookOpen} label="Resources submitted" value={ownedResources.length} color="sky" /></div>
      <DashboardCalendar resources={approvedResources} entries={calendarEntries.filter((entry) => entry.userId === currentUser.id)} onAdd={addCalendarEntry} onRemove={removeCalendarEntry} />
      <div className="dashboard-content-grid"><div className="dashboard-column"><div className="content-card"><div className="card-header-line"><div><span className="eyebrow">QUICK ACTIONS</span><h2>What would you like to do?</h2></div><Sparkles size={21} /></div><div className="quick-action-grid"><button onClick={() => navigate('/resources')}><span className="quick-icon quick-mint"><Search size={19} /></span><strong>Find a resource</strong><small>Discover study support</small><ArrowRight size={16} /></button><button onClick={() => requireUser(() => navigate('/add-material'))}><span className="quick-icon quick-peach"><Package size={19} /></span><strong>List a material</strong><small>Share school essentials</small><ArrowRight size={16} /></button><button onClick={() => requireUser(() => navigate('/submit-resource'))}><span className="quick-icon quick-blue"><Plus size={19} /></span><strong>Add a resource</strong><small>Help others find it</small><ArrowRight size={16} /></button><button onClick={() => navigate('/requests')}><span className="quick-icon quick-lavender"><Send size={19} /></span><strong>Check requests</strong><small>Follow up on exchanges</small><ArrowRight size={16} /></button></div></div>
        <div className="content-card"><div className="card-header-line"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>Recently explored</h2></div><button className="text-link" onClick={() => navigate('/resources')}>Explore more <ArrowRight size={15} /></button></div>{recentlyViewed.length ? <div className="recent-list">{recentlyViewed.slice(0, 4).map((item) => { const isResource = 'organization' in item; return <button className="recent-item" key={item.id} onClick={() => navigate(isResource ? `/resources/${item.id}` : `/materials/${item.id}`)}><span className={`recent-icon art-${item.color}`}><TileIcon name={item.icon} size={19} /></span><span><strong>{item.title}</strong><small>{isResource ? 'OpenDoor resource' : 'ClassCycle material'}</small></span><ArrowRight size={15} /></button>; })}</div> : <div className="mini-empty"><Compass size={22} /><p>Your recently viewed resources will show up here.</p></div>}</div><div className="content-card"><div className="card-header-line"><div><span className="eyebrow">YOUR SHORTLIST</span><h2>Saved resources</h2></div><Bookmark size={20} /></div>{savedResources.length ? <div className="recent-list">{savedResources.slice(0, 4).map((resource) => <button className="recent-item" key={resource.id} onClick={() => navigate(`/resources/${resource.id}`)}><span className={`recent-icon art-${resource.color}`}><TileIcon name={resource.icon} size={19} /></span><span><strong>{resource.title}</strong><small>{resource.category} · {resource.region}</small></span><ArrowRight size={15} /></button>)}</div> : <div className="mini-empty"><Bookmark size={22} /><p>Save a learning resource to keep it handy for your next study session.</p><button className="text-link" onClick={() => navigate('/resources')}>Find a resource <ArrowRight size={15} /></button></div>}</div>
      </div><div className="dashboard-column"><div className="content-card"><div className="card-header-line"><div><span className="eyebrow">REQUESTS</span><h2>Latest updates</h2></div><button className="icon-link" onClick={() => navigate('/requests')} aria-label="View all requests"><ArrowRight size={18} /></button></div>{[...made, ...received].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4).length ? <div className="request-mini-list">{[...made, ...received].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4).map((request) => <div className="request-mini" key={`${request.id}-${request.requesterId}`}><span className={`status-mark status-${request.status.toLowerCase()}`} /><div><strong>{request.materialTitle}</strong><small>{request.requesterId === currentUser.id ? `You requested from ${request.ownerName}` : `${request.requesterName} requested from you`}</small></div><StatusPill status={request.status} /></div>)}</div> : <div className="mini-empty"><Send size={22} /><p>No requests yet. Find a material that could help with your studies.</p><button className="text-link" onClick={() => navigate('/materials')}>Browse materials <ArrowRight size={15} /></button></div>}<button className="btn btn-block btn-outline" onClick={() => navigate('/requests')}>View all requests</button></div>
        <div className="content-card notification-preview"><div className="card-header-line"><div><span className="eyebrow">UPDATES</span><h2>Notifications</h2></div><Bell size={20} /></div>{personalNotifications.length ? <div className="notification-mini-list">{personalNotifications.map((item) => <button key={item.id} onClick={() => { markNotificationRead(item.id); navigate('/notifications'); }} className={`notification-mini ${!item.read ? 'notification-unread' : ''}`}><span className="notification-dot" /><span><strong>{item.title}</strong><small>{item.message}</small><em>{dateLabel(item.createdAt)}</em></span></button>)}</div> : <div className="mini-empty"><Bell size={22} /><p>You’re all caught up. New updates will appear here.</p></div>}<button className="text-link" onClick={() => navigate('/notifications')}>See all notifications <ArrowRight size={15} /></button></div>
      </div></div>
      {isAdmin && <div className="admin-callout"><span><ShieldCheck size={21} /></span><div><strong>Administrator tools are enabled</strong><p>Review community submissions and manage demo reports. This is not production-grade access control.</p></div><button className="btn btn-primary" onClick={() => navigate('/admin')}>Open admin review <ArrowRight size={15} /></button></div>}
      <PrototypeNotice /></section>;
  };

  const renderRequests = () => {
    if (!currentUser) return <SignInPrompt onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
    const sent = app.requests.filter((request) => request.requesterId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const received = app.requests.filter((request) => request.ownerId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const requestRow = (request: RequestRecord, outgoing: boolean) => <article className="request-card" key={`${outgoing ? 'out' : 'in'}-${request.id}`}><div className="request-card-main"><span className="request-product-icon"><Package size={22} /></span><div><h3>{request.materialTitle}</h3><p>{outgoing ? `Requested from ${request.ownerName}` : `Request from ${request.requesterName}`}</p><small><Clock3 size={13} /> Submitted {dateLabel(request.createdAt)} · Updated {dateLabel(request.updatedAt)}</small></div></div><StatusPill status={request.status} /><div className="request-message"><span>Request message</span><p>{request.message}</p></div><div className="request-card-actions">{outgoing && request.status === 'Pending' && <button className="btn btn-outline btn-sm" onClick={() => changeRequestStatus(request.id, 'Cancelled')}>Cancel request</button>}{!outgoing && request.status === 'Pending' && <><button className="btn btn-primary btn-sm" onClick={() => changeRequestStatus(request.id, 'Approved')}><Check size={14} /> Approve</button><button className="btn btn-outline btn-sm" onClick={() => changeRequestStatus(request.id, 'Rejected')}>Decline</button></>}{!outgoing && request.status === 'Approved' && <button className="btn btn-primary btn-sm" onClick={() => changeRequestStatus(request.id, 'Completed')}><CheckCircle2 size={14} /> Mark completed</button>}<button className="text-link" onClick={() => navigate(`/materials/${request.materialId}`)}>View item <ArrowRight size={14} /></button></div></article>;
    return <section className="wrap page-shell requests-shell"><div className="page-heading-simple"><span className="eyebrow"><Send size={14} /> REQUEST CENTER</span><h1>Requests, kept<br /><em>in one place.</em></h1><p>Track what you’ve asked for, respond to people interested in your listings, and keep the exchange clear.</p></div><div className="request-summary"><div><strong>{sent.length}</strong><span>Requests sent</span></div><div><strong>{received.length}</strong><span>Requests received</span></div><div><strong>{[...sent, ...received].filter((request) => request.status === 'Pending').length}</strong><span>Awaiting response</span></div></div>
      <div className="request-section"><div className="section-subheading"><div><span className="eyebrow">YOUR OUTGOING REQUESTS</span><h2>Items you requested</h2></div><span className="count-bubble">{sent.length}</span></div>{sent.length ? <div className="request-list">{sent.map((request) => requestRow(request, true))}</div> : <EmptyState icon={Send} title="No requests sent yet" text="When you request a material, you can track its progress here." action="Browse materials" onAction={() => navigate('/materials')} />}</div>
      <div className="request-section"><div className="section-subheading"><div><span className="eyebrow">YOUR INCOMING REQUESTS</span><h2>People interested in your listings</h2></div><span className="count-bubble">{received.length}</span></div>{received.length ? <div className="request-list">{received.map((request) => requestRow(request, false))}</div> : <EmptyState icon={Package} title="No incoming requests" text="When a learner requests a material you listed, it will appear here." action="List a material" onAction={() => navigate('/add-material')} />}</div><PrototypeNotice /></section>;
  };

  const renderNotifications = () => {
    if (!currentUser) return <SignInPrompt onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
    const notifications = app.notifications.filter((item) => item.userId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return <section className="wrap page-shell notifications-shell"><div className="results-topline"><div><span className="eyebrow"><Bell size={14} /> YOUR UPDATES</span><h1>Notifications</h1><p className="subdued-lead">Request activity, submission reviews and helpful updates from EduLoop.</p></div><div className="button-row"><button className="btn btn-outline" onClick={markAllRead}><CheckCheckIcon /> Mark all read</button><button className="btn btn-outline" onClick={clearRead}><Trash2 size={15} /> Clear read</button></div></div>{notifications.length ? <div className="notifications-list">{notifications.map((item) => <article className={`notification-card ${!item.read ? 'is-unread' : ''}`} key={item.id}><span className="notification-large-icon"><Bell size={19} /></span><div className="notification-card-body"><div className="notification-title-line"><h3>{item.title}</h3>{!item.read && <span className="new-label">NEW</span>}</div><p>{item.message}</p><small>{dateLabel(item.createdAt)}</small></div>{!item.read && <button className="icon-button" aria-label="Mark notification as read" onClick={() => markNotificationRead(item.id)}><Check size={17} /></button>}</article>)}</div> : <EmptyState icon={Bell} title="No notifications yet" text="When something changes in your requests or submissions, updates will show up here." />}</section>;
  };

  const renderAbout = () => <section className="wrap page-shell about-shell"><div className="about-hero"><span className="eyebrow eyebrow-light"><HeartHandshake size={14} /> OUR PURPOSE</span><h1>Good learning tools<br />shouldn’t stop at<br /><em>one learner.</em></h1><p>EduLoop Philippines is a student-project prototype imagining a simple way to discover learning support and keep school materials in use.</p><div className="about-hero-mark"><BookOpen size={38} /><span>LEARN<br />SHARE<br />REPEAT</span></div></div>
      <div className="about-intro-grid"><div><span className="eyebrow"><span className="eyebrow-line" /> THE PROBLEM WE'RE EXPLORING</span><h2>Sometimes access is about<br />finding what’s already there.</h2></div><p>Students may need a quiet place to study, extra practice, a book for one subject or a calculator for a short unit. At the same time, communities may already have spaces, guides and materials that can help. EduLoop is a concept for making those connections easier to discover.</p></div>
      <div className="about-pillars"><article><span className="pillar-icon pillar-green"><Search size={23} /></span><span className="eyebrow">01 · DISCOVER</span><h3>OpenDoor</h3><p>A directory of libraries, study spaces, peer tutoring and online learning resources, with helpful notes about location, cost, schedule and access.</p><button className="text-link" onClick={() => navigate('/resources')}>Explore the directory <ArrowRight size={15} /></button></article><article><span className="pillar-icon pillar-peach"><HandHeart size={23} /></span><span className="eyebrow">02 · REUSE</span><h3>ClassCycle</h3><p>A material exchange for students and contributors to offer school supplies through donations, borrowing or swaps.</p><button className="text-link" onClick={() => navigate('/materials')}>Browse the exchange <ArrowRight size={15} /></button></article><article><span className="pillar-icon pillar-blue"><Users size={23} /></span><span className="eyebrow">03 · CONNECT</span><h3>Community-led</h3><p>Students can request items and contributors can share resources. Admin review is included in the prototype to demonstrate moderation.</p><button className="text-link" onClick={() => { setAuthMode('register'); setAuthError(''); }}>Join the demo <ArrowRight size={15} /></button></article></div>
      <div className="sdg-panel"><div className="sdg-number">4</div><div><span className="eyebrow eyebrow-light">UNITED NATIONS SUSTAINABLE DEVELOPMENT GOALS</span><h2>Quality Education</h2><p>EduLoop aligns with SDG 4 by exploring ways to improve access to learning opportunities and support lifelong learning. This prototype is a small concept demonstration—not a claim that one website can solve education inequality.</p><a href="https://sdgs.un.org/goals/goal4" target="_blank" rel="noreferrer">Learn about SDG 4 <ExternalLink size={14} /></a></div></div>
      <div className="limits-section"><span className="eyebrow"><span className="eyebrow-line" /> IMPORTANT TO KNOW</span><h2>Prototype scope and limitations</h2><div className="limit-grid"><div><CheckCircle2 size={19} /><h3>What this demo shows</h3><p>Directory browsing, combined filters, detailed listings, local demo accounts, request handling, notifications and administrator review flows.</p></div><div><CircleHelp size={19} /><h3>What it does not provide</h3><p>No shared online database, secure authentication, identity verification, live provider availability, payment handling, actual partnerships or guaranteed listings.</p></div><div><ShieldCheck size={19} /><h3>Use it responsibly</h3><p>All listed organizations and user details are fictional sample data. Verify real-world services independently and do not add sensitive personal details.</p></div></div></div><PrototypeNotice /></section>;

  const renderSubmitResource = () => {
    if (!currentUser) return <SignInPrompt onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
    return <section className="wrap form-page"><div className="form-intro"><button className="back-link" onClick={() => navigate('/dashboard')}><ArrowLeft size={15} /> Back to dashboard</button><span className="eyebrow"><BookOpen size={14} /> OPENDOOR CONTRIBUTION</span><h1>Share a learning<br /><em>resource.</em></h1><p>Help other learners discover a study space, tutoring option, library or online guide. Clear details make a listing more useful.</p><div className="form-note"><ShieldCheck size={19} /><span>New submissions stay private until an administrator reviews and approves them.</span></div></div><form className="form-card" onSubmit={submitResource}><div className="form-section-title"><span>01</span><div><h2>Resource basics</h2><p>Give the listing a clear, descriptive identity.</p></div></div><div className="form-grid"><Field label="Resource title" required><input name="title" required minLength={4} placeholder="e.g. Community reading corner" /></Field><Field label="Category" required><select name="category" required>{resourceCategories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Organization or provider"><input name="organization" defaultValue={currentUser.schoolOrOrganization} placeholder="Who manages this resource?" /></Field><Field label="City or location" required><input name="city" required placeholder="e.g. Cebu City, Cebu" /></Field><Field label="Region" required><select name="region" defaultValue={currentUser.region}>{philippineRegions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Learning mode"><select name="mode"><option>In person</option><option>Online</option><option>Hybrid</option></select></Field><Field label="Cost"><select name="cost"><option>Free</option><option>Low-cost</option><option>Varies</option></select></Field><Field label="Website or official link"><input name="website" type="url" placeholder="https://... (optional)" /></Field></div><div className="form-section-title form-section-next"><span>02</span><div><h2>Helpful details</h2><p>Describe who it serves and what a learner should expect.</p></div></div><Field label="Short summary" required><input name="shortDescription" required maxLength={180} placeholder="One sentence shown on resource cards" /></Field><Field label="Full description" required hint="At least 20 characters. Mention what learners can do or find here."><textarea name="description" required minLength={20} rows={5} placeholder="Describe the resource, its purpose and any useful context..." /></Field><div className="form-grid"><Field label="Subjects (comma-separated)"><input name="subjects" placeholder="Reading, Mathematics, Research" /></Field><Field label="Intended learners (comma-separated)"><input name="audience" placeholder="Senior high school, College" /></Field><Field label="Schedule or opening hours"><input name="schedule" placeholder="e.g. Weekdays, 9 AM–5 PM" /></Field><Field label="Preferred contact method"><select name="contactMethod"><option>EduLoop chat</option><option>Public email</option><option>Organization contact</option></select></Field><Field label="Public contact detail (optional)" hint="Use a public organizational email or contact channel, never a home address."><input name="contactInfo" maxLength={160} placeholder="e.g. learningdesk@example.org" /></Field><Field label="Amenities or features (comma-separated)"><input name="amenities" placeholder="Study desks, Wi-Fi, group space" /></Field></div><div className="event-publish-section"><div className="event-publish-heading"><CalendarDays size={19} /><div><strong>Announced event schedule (optional)</strong><p>Only check this for a formally announced event with a confirmed date and start/end time. Eligible events can be added to a learner’s dashboard calendar.</p></div></div><label className="event-publish-check"><input name="isAnnouncedEvent" type="checkbox" /> <span>This resource is an announced, scheduled event</span></label><div className="form-grid event-publish-fields"><Field label="Event date"><input name="eventDate" type="date" /></Field><Field label="Start time"><input name="eventStartTime" type="time" /></Field><Field label="End time"><input name="eventEndTime" type="time" /></Field></div></div><Field label="Steps to access (one per line)" hint="Give practical steps, such as reservations or what to bring."><textarea name="accessSteps" rows={4} placeholder={'Check the opening hours\nAsk about student access\nBring a school ID if required'} /></Field><Field label="Contact notes and limitations"><textarea name="contactNotes" rows={3} placeholder="What should learners confirm before using this resource? Avoid private phone numbers or home addresses." /></Field><div className="form-footer"><span><Info size={15} /> Your submission is marked Pending Review until approved.</span><button className="btn btn-primary" type="submit">Submit for review <ArrowRight size={16} /></button></div></form></section>;
  };

  const renderAddMaterial = () => {
    if (!currentUser) return <SignInPrompt onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
    return <section className="wrap form-page"><div className="form-intro"><button className="back-link" onClick={() => navigate('/dashboard')}><ArrowLeft size={15} /> Back to dashboard</button><span className="eyebrow"><Package size={14} /> CLASSCYCLE CONTRIBUTION</span><h1>Give school supplies<br />a <em>second chapter.</em></h1><p>List a useful item so another learner can find it. Set clear expectations for condition, exchange type and handoff.</p><div className="form-note form-note-peach"><HandHeart size={19} /><span>Never include your home address or private schedule in a public listing. Coordinate safely after a request.</span></div></div><form className="form-card" onSubmit={submitMaterial}><div className="form-section-title"><span>01</span><div><h2>Item information</h2><p>Be honest about condition and what is included.</p></div></div><div className="form-grid"><Field label="Material title" required><input name="title" required minLength={3} placeholder="e.g. Scientific calculator" /></Field><Field label="Category" required><select name="category">{materialCategories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Condition" required><select name="condition"><option>Like new</option><option>New</option><option>Good</option><option>Well-used</option></select></Field><Field label="Exchange type" required><select name="exchangeType"><option>Donate</option><option>Borrow</option><option>Swap</option></select></Field><Field label="City or location" required><input name="city" required placeholder="e.g. Lapu-Lapu City, Cebu" /></Field><Field label="Region" required><select name="region" defaultValue={currentUser.region}>{philippineRegions.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div className="form-section-title form-section-next"><span>02</span><div><h2>Exchange details</h2><p>Help people decide whether the item fits their needs.</p></div></div><Field label="Description" required hint="At least 20 characters. Mention wear, compatibility or anything a recipient should know."><textarea name="description" required minLength={20} rows={5} placeholder="Describe the item’s condition and why it may be useful..." /></Field><Field label="Included items (comma-separated)"><input name="includedItems" placeholder="Calculator, cover, instruction booklet" /></Field><Field label="Pickup and handoff notes" hint="Do not include a personal address, private phone number or exact schedule."><textarea name="pickupNotes" rows={3} placeholder="e.g. We can agree on a public campus pickup point after the request is approved." /></Field><div className="form-grid"><Field label="Preferred contact method"><select name="contactMethod"><option>EduLoop chat</option><option>Public email</option><option>Organization contact</option></select></Field><Field label="Public contact detail (optional)" hint="Use an organization or public contact address; never list a home address."><input name="contactInfo" maxLength={160} placeholder="e.g. learningdesk@example.org" /></Field></div><div className="form-footer"><span><Info size={15} /> New listings stay Pending Review before appearing in the exchange.</span><button className="btn btn-primary" type="submit">Submit listing <ArrowRight size={16} /></button></div></form></section>;
  };

  const renderAdmin = () => {
    if (!currentUser || !isAdmin) return <section className="wrap page-shell"><EmptyState icon={ShieldCheck} title="Administrator access required" text="This review area is limited to the prototype administrator role. Log in with the demo administrator account to inspect the moderation workflow." action="Log in as admin" onAction={() => { setAuthMode('login'); setAuthError(''); }} /></section>;
    const pendingResources = app.resources.filter((item) => item.status === 'Pending Review');
    const pendingMaterials = app.materials.filter((item) => item.status === 'Pending Review');
    const openReports = app.reports.filter((item) => item.status === 'Open');
    return <section className="wrap page-shell admin-shell"><div className="admin-header"><div><span className="eyebrow"><ShieldCheck size={14} /> ADMINISTRATION · DEMO MODE</span><h1>Community review<br /><em>and moderation.</em></h1><p>Keep listings useful, relevant and safe by reviewing submissions and responding to reports.</p></div><div className="admin-warning"><LockKeyhole size={19} /><div><strong>Demo Admin Mode</strong><span>Not secure authentication</span></div></div></div>
      <div className="admin-metrics"><Metric icon={BookOpen} label="Resources to review" value={pendingResources.length} color="mint" /><Metric icon={Package} label="Materials to review" value={pendingMaterials.length} color="peach" /><Metric icon={MessageSquareWarning} label="Open reports" value={openReports.length} color="lavender" /><Metric icon={Users} label="Prototype accounts" value={app.users.length} color="sky" /></div>
      <div className="admin-review-grid"><div className="content-card"><div className="card-header-line"><div><span className="eyebrow">OPENDOOR</span><h2>Pending resources</h2></div><span className="count-bubble">{pendingResources.length}</span></div>{pendingResources.length ? pendingResources.map((item) => <div className="moderation-row" key={item.id}><div className={`moderation-icon art-${item.color}`}><TileIcon name={item.icon} size={20} /></div><div className="moderation-body"><strong>{item.title}</strong><span>{item.category} · {item.region}</span><small>Submitted by {item.createdByName} · {dateLabel(item.createdAt)}</small><p>{item.description}</p><div className="moderation-actions"><button className="btn btn-primary btn-sm" onClick={() => adminReview(item.id, 'Resource', 'Approved')}><Check size={14} /> Approve</button><button className="btn btn-outline btn-sm" onClick={() => { setRejectTarget({ id: item.id, type: 'Resource' }); setRejectReason(''); }}>Reject with reason</button></div></div></div>) : <div className="mini-empty"><CircleCheck size={22} /><p>Nothing waiting for resource review.</p></div>}</div>
        <div className="content-card"><div className="card-header-line"><div><span className="eyebrow">CLASSCYCLE</span><h2>Pending materials</h2></div><span className="count-bubble">{pendingMaterials.length}</span></div>{pendingMaterials.length ? pendingMaterials.map((item) => <div className="moderation-row" key={item.id}><div className={`moderation-icon art-${item.color}`}><TileIcon name={item.icon} size={20} /></div><div className="moderation-body"><strong>{item.title}</strong><span>{item.category} · {item.region}</span><small>Submitted by {item.ownerName} · {dateLabel(item.createdAt)}</small><p>{item.description}</p><div className="moderation-actions"><button className="btn btn-primary btn-sm" onClick={() => adminReview(item.id, 'Material', 'Approved')}><Check size={14} /> Approve</button><button className="btn btn-outline btn-sm" onClick={() => { setRejectTarget({ id: item.id, type: 'Material' }); setRejectReason(''); }}>Reject with reason</button></div></div></div>) : <div className="mini-empty"><CircleCheck size={22} /><p>Nothing waiting for material review.</p></div>}</div></div>
      <div className="content-card admin-reports"><div className="card-header-line"><div><span className="eyebrow">COMMUNITY FEEDBACK</span><h2>Listing reports</h2></div><span className="count-bubble">{openReports.length} open</span></div>{app.reports.length ? app.reports.map((report) => <div className="report-row" key={report.id}><span className={`report-icon ${report.status === 'Open' ? 'report-open' : 'report-closed'}`}><MessageSquareWarning size={18} /></span><div className="report-body"><div><strong>{report.targetTitle}</strong><span className={`pill ${report.status === 'Open' ? 'pill-yellow' : 'pill-gray'}`}>{report.status}</span></div><p>{report.reason}{report.details ? ` — ${report.details}` : ''}</p><small>{report.targetType} · Reported by {report.reporterName} · {dateLabel(report.createdAt)}</small></div>{report.status === 'Open' && <div className="report-actions"><button className="btn btn-outline btn-sm" onClick={() => updateApp((previous) => ({ ...previous, reports: previous.reports.map((item) => item.id === report.id ? { ...item, status: 'Resolved' } : item), activity: [logActivity(`Admin resolved report for “${report.targetTitle}”.`), ...previous.activity].slice(0, 40) }))}>Resolve</button><button className="icon-button" aria-label="Dismiss report" onClick={() => updateApp((previous) => ({ ...previous, reports: previous.reports.map((item) => item.id === report.id ? { ...item, status: 'Dismissed' } : item), activity: [logActivity(`Admin dismissed report for “${report.targetTitle}”.`), ...previous.activity].slice(0, 40) }))}><X size={16} /></button></div>}</div>) : <div className="mini-empty"><CircleCheck size={22} /><p>No listing reports have been submitted.</p></div>}</div>
      <div className="content-card"><div className="card-header-line"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Admin activity log</h2></div><Clock3 size={20} /></div><div className="activity-list">{app.activity.slice(0, 8).map((item) => <div className="activity-row" key={item.id}><span className="activity-dot" /><p>{item.message}</p><small>{dateLabel(item.createdAt)}</small></div>)}</div></div>
      <PrototypeNotice /></section>;
  };

  const routeToView = () => {
    if (route === '/' || route === '') return renderHome();
    if (route === '/resources') return renderResources();
    if (route === '/materials') return renderMaterials();
    if (route === '/dashboard') return renderDashboard();
    if (route === '/requests') return renderRequests();
    if (route === '/notifications') return renderNotifications();
    if (route === '/about') return renderAbout();
    if (route === '/submit-resource') return renderSubmitResource();
    if (route === '/add-material') return renderAddMaterial();
    if (route === '/admin') return renderAdmin();
    if (route.startsWith('/resources/')) return detailResource ? renderResourceDetail(detailResource) : <section className="wrap page-shell"><EmptyState icon={BookOpen} title="Resource not found" text="This listing may have been removed or is still awaiting review." action="Back to resources" onAction={() => navigate('/resources')} /></section>;
    if (route.startsWith('/materials/')) return detailMaterial ? renderMaterialDetail(detailMaterial) : <section className="wrap page-shell"><EmptyState icon={Package} title="Material not found" text="This listing may have been removed or is still awaiting review." action="Back to materials" onAction={() => navigate('/materials')} /></section>;
    return renderHome();
  };

  return <div className="app-shell">
    <div className="prototype-topbar"><span className="topbar-dot" /> Student Project Prototype <span className="topbar-separator">/</span> All sample listings and user information are fictional <button onClick={() => navigate('/about')}>About this demo <ArrowRight size={12} /></button></div>
    <header className="site-header"><div className="header-inner wrap"><button className="brand" onClick={() => navigate('/')} aria-label="EduLoop home"><span className="brand-mark"><span /><span /><span /></span><span className="brand-type"><strong>EduLoop</strong><small>PHILIPPINES</small></span></button>
      <nav className={`main-nav ${mobileMenu ? 'nav-open' : ''}`} aria-label="Main navigation">{navItems.map((item) => <button key={item.path} className={activeTab === item.label ? 'nav-active' : ''} onClick={() => navigate(item.path)}>{item.label}</button>)}{currentUser && <><button className={route === '/dashboard' ? 'nav-active' : ''} onClick={() => navigate('/dashboard')}>My dashboard</button><button className={`nav-notification ${route === '/notifications' ? 'nav-active' : ''}`} onClick={() => navigate('/notifications')}>Updates {unreadCount > 0 && <span>{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>{isAdmin && <button className={route === '/admin' ? 'nav-active' : ''} onClick={() => navigate('/admin')}>Admin review</button>}</>}</nav>
      <div className="header-actions">{currentUser ? <div className="profile-menu-wrap"><button className="profile-trigger" onClick={() => setProfileMenu((value) => !value)} aria-expanded={profileMenu}><span className="avatar avatar-header">{initials(currentUser.name)}</span><span className="profile-trigger-label"><strong>{currentUser.name.split(' ')[0]}</strong><small>{currentUser.role}</small></span><ChevronDown size={15} /></button>{profileMenu && <div className="profile-dropdown"><div className="dropdown-user"><span className="avatar">{initials(currentUser.name)}</span><div><strong>{currentUser.name}</strong><small>{currentUser.email}</small></div></div><button onClick={() => { navigate('/dashboard'); setProfileMenu(false); }}><User size={15} /> My dashboard</button><button onClick={() => { navigate('/requests'); setProfileMenu(false); }}><Send size={15} /> My requests</button><button onClick={() => { navigate('/notifications'); setProfileMenu(false); }}><Bell size={15} /> Notifications {unreadCount > 0 && <span className="dropdown-count">{unreadCount}</span>}</button>{isAdmin && <button onClick={() => { navigate('/admin'); setProfileMenu(false); }}><ShieldCheck size={15} /> Admin review</button>}<button className="dropdown-logout" onClick={logout}><LogOut size={15} /> Log out</button></div>}</div> : <><button className="login-link" onClick={() => { setAuthMode('login'); setAuthError(''); }}>Log in</button><button className="btn btn-primary btn-sm" onClick={() => { setAuthMode('register'); setAuthError(''); }}>Create account <ArrowRight size={14} /></button></>}<button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="Toggle navigation">{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div></header>
    <main>{routeToView()}</main>
    <ChatDock currentUser={currentUser} target={chatTarget} onClearTarget={() => setChatTarget(null)} onRequireLogin={() => { setAuthMode('login'); setAuthError('Please log in or create an account to message a listing owner.'); }} />
    <DiscoveryMap resources={approvedResources} materials={approvedMaterials} onOpenResource={(id) => navigate('/resources/' + id)} onOpenMaterial={(id) => navigate('/materials/' + id)} />
    <footer className="site-footer"><div className="wrap footer-main"><div className="footer-brand-block"><button className="brand brand-footer" onClick={() => navigate('/')}><span className="brand-mark"><span /><span /><span /></span><span className="brand-type"><strong>EduLoop</strong><small>PHILIPPINES</small></span></button><p>Find resources. Share what you can.<br />Make learning more accessible.</p></div><div className="footer-links"><div><strong>Explore</strong><button onClick={() => navigate('/resources')}>Learning resources</button><button onClick={() => navigate('/materials')}>Materials exchange</button><button onClick={() => navigate('/about')}>About EduLoop</button></div><div><strong>Your account</strong><button onClick={() => currentUser ? navigate('/dashboard') : setAuthMode('login')}>Dashboard</button><button onClick={() => currentUser ? navigate('/requests') : setAuthMode('login')}>My requests</button><button onClick={() => setAuthMode('register')}>Join the community</button></div></div><div className="footer-sdg"><span className="sdg-mini">4</span><div><strong>Quality Education</strong><p>A prototype concept inspired by UN Sustainable Development Goal 4.</p></div></div></div><div className="wrap footer-bottom"><span>© 2026 EduLoop Philippines · BSIT school project</span><span>Not an official government or education-agency service.</span></div></footer>

    {notice && <div className={`toast toast-${notice.type}`} role="status"><span>{notice.type === 'success' ? <CheckCircle2 size={18} /> : notice.type === 'error' ? <CircleHelp size={18} /> : <Info size={18} />}</span><p>{notice.message}</p><button onClick={() => setNotice(null)} aria-label="Dismiss notice"><X size={15} /></button></div>}

    {authMode && <div className="modal-backdrop auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setAuthMode(null); setAuthError(''); } }}><div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-heading"><button className="modal-close" onClick={() => { setAuthMode(null); setAuthError(''); }} aria-label="Close"><X size={20} /></button><div className="auth-brand"><span className="brand-mark"><span /><span /><span /></span><span className="brand-type"><strong>EduLoop</strong><small>PHILIPPINES</small></span></div><span className="eyebrow">{authMode === 'register' ? 'JOIN THE LOOP' : 'WELCOME BACK'}</span><h2 id="auth-heading">{authMode === 'register' ? <>Make room for<br /><em>more learning.</em></> : <>Good to have<br /><em>you here.</em></>}</h2><p className="auth-subtitle">{authMode === 'register' ? 'Create a demo account to request materials, share resources or help moderate the community.' : 'Log in to pick up where you left off and manage your EduLoop activity.'}</p>
      {authMode === 'register' ? <form className="auth-form" onSubmit={handleRegister}><Field label="Full name" required><div className="field-icon"><UserRound size={16} /><input name="name" required autoComplete="name" placeholder="Your full name" /></div></Field><Field label="Email address" required><div className="field-icon"><Mail size={16} /><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></div></Field><Field label="Password" required hint="At least 6 characters in this demo."><div className="field-icon"><LockKeyhole size={16} /><input name="password" type={showPassword ? 'text' : 'password'} minLength={6} required autoComplete="new-password" placeholder="Create a password" /><button type="button" className="field-action" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field><Field label="I’m joining as" required><select name="role" defaultValue="Student"><option value="Student">Student / learner</option><option value="Contributor">Contributor / donator</option><option value="Administrator">Administrator (demo only)</option></select></Field><Field label="Region" required><select name="region" defaultValue="Central Visayas">{philippineRegions.map((region) => <option key={region}>{region}</option>)}</select></Field><Field label="School or organization"><input name="affiliation" placeholder="Optional" /></Field><div className="admin-code-note"><ShieldCheck size={16} /><span>Administrator signup requires the demo code <code>{DEMO_ADMIN_CODE}</code>. This is not secure access control.</span></div><Field label="Admin access code (administrators only)"><input name="adminCode" placeholder="Leave blank for student/contributor" autoComplete="off" /></Field><label className="consent-check"><input type="checkbox" required /> <span>I understand this is a classroom prototype and the account is stored in this browser.</span></label><button className="btn btn-primary btn-block btn-large" type="submit">Create my account <ArrowRight size={16} /></button></form> : <form className="auth-form" onSubmit={handleLogin}><Field label="Email address" required><div className="field-icon"><Mail size={16} /><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></div></Field><Field label="Password" required><div className="field-icon"><LockKeyhole size={16} /><input name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Your password" /><button type="button" className="field-action" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field><button className="btn btn-primary btn-block btn-large" type="submit">Log in <ArrowRight size={16} /></button></form>}
      {authError && <div className="form-error"><CircleHelp size={16} /> {authError}</div>}
      {authMode === 'login' && <div className="demo-logins"><div className="demo-logins-head"><span>TRY A DEMO ROLE</span><small>Fictional test accounts</small></div><button onClick={() => loginAsDemo('mika@eduloop.demo', 'student123')}><span className="demo-role-icon role-student"><User size={15} /></span><span><strong>Student</strong><small>Mika Santos</small></span><ArrowRight size={15} /></button><button onClick={() => loginAsDemo('paolo@eduloop.demo', 'contribute123')}><span className="demo-role-icon role-contributor"><HandHeart size={15} /></span><span><strong>Contributor</strong><small>Paolo Reyes</small></span><ArrowRight size={15} /></button><button onClick={() => loginAsDemo('lea@eduloop.demo', 'admin123')}><span className="demo-role-icon role-admin"><ShieldCheck size={15} /></span><span><strong>Administrator</strong><small>Lea Cruz · demo admin</small></span><ArrowRight size={15} /></button></div>}
      <div className="auth-switch">{authMode === 'register' ? <>Already have a demo account? <button onClick={() => { setAuthMode('login'); setAuthError(''); }}>Log in</button></> : <>New to EduLoop? <button onClick={() => { setAuthMode('register'); setAuthError(''); }}>Create an account</button></>}</div><p className="auth-privacy"><LockKeyhole size={12} /> Demo only — not secure authentication. Do not reuse a real password.</p></div></div>}

    {requestMaterial && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequestMaterial(null); }}><div className="dialog-modal" role="dialog" aria-modal="true" aria-labelledby="request-title"><button className="modal-close" onClick={() => setRequestMaterial(null)} aria-label="Close"><X size={20} /></button><span className="dialog-icon dialog-icon-green"><Send size={23} /></span><span className="eyebrow">CLASSCYCLE REQUEST</span><h2 id="request-title">Request this material</h2><p className="dialog-subtitle">You’re requesting <strong>{requestMaterial.title}</strong> from {requestMaterial.ownerName}. A request is not yet a confirmed exchange.</p><form onSubmit={sendRequest}><Field label="Message to the contributor" hint="Explain how you plan to use it or ask a practical question."><textarea rows={4} value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} placeholder="Hi! I need this for..." /></Field><div className="dialog-reminder"><ShieldCheck size={17} /><span>Never share private account details. Agree on a safe public handoff after the owner responds.</span></div><div className="dialog-actions"><button className="btn btn-outline" type="button" onClick={() => setRequestMaterial(null)}>Cancel</button><button className="btn btn-primary" type="submit">Send request <ArrowRight size={15} /></button></div></form></div></div>}

    {rejectTarget && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRejectTarget(null); }}><div className="dialog-modal" role="dialog" aria-modal="true" aria-labelledby="reject-title"><button className="modal-close" onClick={() => setRejectTarget(null)} aria-label="Close"><X size={20} /></button><span className="dialog-icon dialog-icon-peach"><MessageSquareWarning size={23} /></span><span className="eyebrow">MODERATION DECISION</span><h2 id="reject-title">Reject submission?</h2><p className="dialog-subtitle">A useful reason helps the submitter understand what needs to be corrected.</p><form onSubmit={(event) => { event.preventDefault(); adminReview(rejectTarget.id, rejectTarget.type, 'Rejected', rejectReason.trim() || 'Please review the listing details and resubmit.'); }}><Field label="Reason for rejection"><textarea rows={4} required value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="e.g. Add clearer access instructions or remove unverifiable claims." /></Field><div className="dialog-actions"><button className="btn btn-outline" type="button" onClick={() => setRejectTarget(null)}>Cancel</button><button className="btn btn-primary" type="submit">Confirm rejection</button></div></form></div></div>}

    {reportDetails && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportDetails(null); }}><div className="dialog-modal" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="modal-close" onClick={() => setReportDetails(null)} aria-label="Close"><X size={20} /></button><span className="dialog-icon dialog-icon-peach"><MessageSquareWarning size={23} /></span><span className="eyebrow">COMMUNITY REPORT</span><h2 id="report-title">Report this listing</h2><p className="dialog-subtitle">Help moderators check if <strong>{reportDetails.title}</strong> needs attention.</p><form onSubmit={submitReport}><Field label="Reason"><select value={reportReason} onChange={(event) => setReportReason(event.target.value)}><option>Incorrect or misleading information</option><option>Listing appears duplicated</option><option>Unsafe or inappropriate content</option><option>Item is no longer available</option><option>Other concern</option></select></Field><Field label="Additional context"><textarea rows={3} value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="Share what moderators should know (optional)." /></Field><div className="dialog-actions"><button className="btn btn-outline" type="button" onClick={() => setReportDetails(null)}>Cancel</button><button className="btn btn-primary" type="submit">Send report <ArrowRight size={15} /></button></div></form></div></div>}
  </div>;
}

function Field({ label, children, required = false, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return <label className="field"><span className="field-label">{label}{required && <i> *</i>}</span>{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}
function EmptyState({ icon: Icon, title, text, action, onAction }: { icon: LucideIcon; title: string; text: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={25} /></span><h3>{title}</h3><p>{text}</p>{action && onAction && <button className="btn btn-outline" onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>;
}
function SignInPrompt({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return <section className="wrap sign-in-prompt"><div className="prompt-icon"><UserPlus size={29} /></div><span className="eyebrow">YOUR EDULOOP SPACE</span><h1>Sign in to keep<br /><em>your loop going.</em></h1><p>Create an account or log in to view your dashboard, follow requests and receive updates on your contributions.</p><div className="button-row"><button className="btn btn-primary" onClick={onLogin}>Log in <ArrowRight size={16} /></button><button className="btn btn-outline" onClick={onRegister}>Create an account</button></div></section>;
}
function Metric({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: number; color: string }) {
  return <div className="metric-card"><span className={`metric-icon metric-${color}`}><Icon size={19} /></span><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-foot">Live demo count</span></div>;
}
function StatusPill({ status }: { status: RequestStatus }) {
  const colors: Record<RequestStatus, string> = { Pending: 'pill-yellow', Approved: 'pill-green', Rejected: 'pill-red', Cancelled: 'pill-gray', Completed: 'pill-blue' };
  return <span className={`pill ${colors[status]}`}>{status}</span>;
}
function PrototypeNotice() {
  return <div className="prototype-notice"><Info size={15} /><span><strong>Student Project Prototype</strong> — All sample listings and user information are fictional. Confirm real-world details independently.</span></div>;
}
function CheckCheckIcon() { return <CheckCircle2 size={15} />; }
