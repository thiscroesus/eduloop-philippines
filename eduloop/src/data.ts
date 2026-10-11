export type Role = 'Student' | 'Contributor' | 'Administrator';
export type ReviewStatus = 'Approved' | 'Pending Review' | 'Rejected';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';
export type MaterialStatus = 'Available' | 'Reserved' | 'Unavailable';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  region: string;
  schoolOrOrganization: string;
  joinedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  region: string;
  city: string;
  organization: string;
  shortDescription: string;
  description: string;
  cost: 'Free' | 'Low-cost' | 'Varies';
  mode: 'Online' | 'In person' | 'Hybrid';
  subjects: string[];
  audience: string[];
  accessSteps: string[];
  schedule: string;
  amenities: string[];
  contactNotes: string;
  website: string;
  createdBy: string;
  createdByName: string;
  status: ReviewStatus;
  createdAt: string;
  featured?: boolean;
  icon: string;
  color: string;
}

export interface Material {
  id: string;
  title: string;
  category: string;
  condition: 'New' | 'Like new' | 'Good' | 'Well-used';
  exchangeType: 'Donate' | 'Borrow' | 'Swap';
  region: string;
  city: string;
  description: string;
  includedItems: string[];
  pickupNotes: string;
  availability: MaterialStatus;
  ownerId: string;
  ownerName: string;
  ownerRole: Role;
  status: ReviewStatus;
  createdAt: string;
  icon: string;
  color: string;
}

export interface RequestRecord {
  id: string;
  materialId: string;
  materialTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ReportRecord {
  id: string;
  targetType: 'Resource' | 'Material';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  reporterName: string;
  status: 'Open' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export interface ActivityRecord {
  id: string;
  message: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  resources: Resource[];
  materials: Material[];
  requests: RequestRecord[];
  notifications: AppNotification[];
  reports: ReportRecord[];
  activity: ActivityRecord[];
  recentlyViewed: Record<string, string[]>;
  savedItems: Record<string, string[]>;
}

const now = '2026-10-11T08:00:00.000Z';

export const DEMO_ADMIN_CODE = 'EDULOOP-DEMO-ADMIN';
export const STORAGE_KEY = 'eduloop-v2';

export const initialUsers: User[] = [
  { id: 'u-mika', name: 'Mika Santos', email: 'mika@eduloop.demo', password: 'student123', role: 'Student', region: 'Eastern Visayas', schoolOrOrganization: 'Leyte Learning Institute', joinedAt: '2026-09-01T08:00:00.000Z' },
  { id: 'u-paolo', name: 'Paolo Reyes', email: 'paolo@eduloop.demo', password: 'contribute123', role: 'Contributor', region: 'Central Visayas', schoolOrOrganization: 'Community Learning Volunteers', joinedAt: '2026-09-05T08:00:00.000Z' },
  { id: 'u-lea', name: 'Lea Cruz', email: 'lea@eduloop.demo', password: 'admin123', role: 'Administrator', region: 'National Capital Region', schoolOrOrganization: 'EduLoop Demo Team', joinedAt: '2026-08-15T08:00:00.000Z' },
];

const resourceRows: Array<Omit<Resource, 'createdBy' | 'createdByName' | 'status' | 'createdAt'>> = [
  { id: 'r1', title: 'Tacloban Community Learning Hub', category: 'Study Spaces', region: 'Eastern Visayas', city: 'Tacloban City, Leyte', organization: 'Tacloban Community Learning Network', shortDescription: 'A welcoming shared space for focused study, group work and guided learning.', description: 'A community-supported learning room for students who need a quiet place to study outside school hours. Volunteers help visitors find reading materials, use the study tables and plan collaborative sessions.', cost: 'Free', mode: 'In person', subjects: ['General study', 'Reading', 'Mathematics', 'Research'], audience: ['Junior high school', 'Senior high school', 'College'], accessSteps: ['Visit the front desk during open hours.', 'Sign the visitor log and present a school ID if available.', 'Ask a volunteer about the quiet zone or group tables.'], schedule: 'Monday–Saturday, 9:00 AM–6:00 PM (demo schedule; confirm before visiting)', amenities: ['Quiet study desks', 'Group-work tables', 'Reading corner', 'Volunteer guidance'], contactNotes: 'A fictional listing for demonstration. Contact details are not provided; confirm access directly with a real local provider.', website: '', icon: 'BookOpen', color: 'mint', featured: true },
  { id: 'r2', title: 'Open Math Help Sessions', category: 'Tutoring', region: 'Central Visayas', city: 'Cebu City, Cebu', organization: 'Cebu Peer Learning Circle', shortDescription: 'Peer-led practice sessions for foundational math and problem-solving.', description: 'A peer-learning concept where volunteer facilitators walk students through examples, practice questions and study routines at a comfortable pace.', cost: 'Free', mode: 'Hybrid', subjects: ['Algebra', 'Geometry', 'Statistics', 'Problem-solving'], audience: ['Junior high school', 'Senior high school'], accessSteps: ['Check the announced session topic.', 'Reserve a seat with the learning circle.', 'Bring a notebook and the questions you are working on.'], schedule: 'Sample sessions on Tuesday and Thursday afternoons', amenities: ['Guided practice', 'Small groups', 'Online follow-up notes'], contactNotes: 'This is a fictional demo program. Session times and participation requirements are illustrative.', website: '', icon: 'Calculator', color: 'sky', featured: true },
  { id: 'r3', title: 'Digital Skills Starter Library', category: 'Online Materials', region: 'National Capital Region', city: 'Online', organization: 'Learn-at-Home Resource Collective', shortDescription: 'Curated beginner-friendly lessons on computer basics and digital safety.', description: 'A sample directory entry for free learning resources covering file management, online research, productivity tools and safe internet habits.', cost: 'Free', mode: 'Online', subjects: ['Computer basics', 'Digital citizenship', 'Productivity', 'Research'], audience: ['Junior high school', 'Senior high school', 'College', 'Adult learners'], accessSteps: ['Open the resource collection from a connected device.', 'Choose a topic based on your current skill level.', 'Save the notes or follow the practice checklist.'], schedule: 'Self-paced; available online at any time', amenities: ['Self-paced modules', 'Beginner guides', 'Practice checklists'], contactNotes: 'The collection name is fictional. Always check any external resource for privacy, accessibility and suitability.', website: 'https://www.deped.gov.ph/', icon: 'Laptop', color: 'lavender', featured: true },
  { id: 'r4', title: 'Barangay Reading Corner', category: 'Libraries', region: 'Western Visayas', city: 'Iloilo City, Iloilo', organization: 'Barangay Learning Support Desk', shortDescription: 'A neighborhood reading nook with storybooks and basic reference materials.', description: 'A model entry for a locally coordinated reading space that supports independent reading, homework and family learning activities.', cost: 'Free', mode: 'In person', subjects: ['Reading', 'Filipino', 'English', 'General knowledge'], audience: ['Elementary', 'Junior high school', 'Families'], accessSteps: ['Ask the barangay hall about reading-corner hours.', 'Register in the visitor book if required.', 'Return shared books to the correct shelf after use.'], schedule: 'Sample weekday afternoon hours', amenities: ['Storybooks', 'Reference shelf', 'Child-friendly seating'], contactNotes: 'Illustrative only. Check with the barangay before planning a visit.', website: '', icon: 'Library', color: 'peach' },
  { id: 'r5', title: 'Science at Home Learning Pack', category: 'Online Materials', region: 'Bicol Region', city: 'Online', organization: 'Open Science Lessons', shortDescription: 'Simple activity guides that connect classroom science to everyday life.', description: 'An online-learning concept with short explanations, observation sheets and low-cost activities designed to make science practice more approachable.', cost: 'Free', mode: 'Online', subjects: ['Biology', 'Physics', 'Earth science', 'Scientific method'], audience: ['Elementary', 'Junior high school', 'Senior high school'], accessSteps: ['Select a lesson appropriate for your grade level.', 'Review the materials and safety notes before starting.', 'Write observations and discuss results with a teacher or adult.'], schedule: 'Self-paced', amenities: ['Printable worksheets', 'Vocabulary guides', 'Reflection prompts'], contactNotes: 'Demo entry only. Adult supervision may be needed for some science activities.', website: 'https://www.deped.gov.ph/', icon: 'FlaskConical', color: 'mint' },
  { id: 'r6', title: 'Davao Student Research Desk', category: 'Study Spaces', region: 'Davao Region', city: 'Davao City, Davao del Sur', organization: 'Campus Research Peer Network', shortDescription: 'A shared study concept focused on research planning and source evaluation.', description: 'A peer-supported space for learners developing research questions, finding sources and organizing references for school projects.', cost: 'Low-cost', mode: 'In person', subjects: ['Research methods', 'Writing', 'Citations', 'Information literacy'], audience: ['Senior high school', 'College'], accessSteps: ['Bring your project instructions and current outline.', 'Ask for a research help slot.', 'Use the provided checklist to track next steps.'], schedule: 'Sample appointment-based hours during the school week', amenities: ['Research planning templates', 'Peer feedback', 'Reference organization tips'], contactNotes: 'Fictional resource. The listing does not represent a confirmed service.', website: '', icon: 'FileText', color: 'sky' },
  { id: 'r7', title: 'Northern Mindanao Homework Circle', category: 'Tutoring', region: 'Northern Mindanao', city: 'Cagayan de Oro City, Misamis Oriental', organization: 'Homework Circle Volunteers', shortDescription: 'A guided group homework session with rotating subject helpers.', description: 'A proposed community study circle where students can compare approaches, ask questions and practice organizing their school workload.', cost: 'Free', mode: 'In person', subjects: ['English', 'Mathematics', 'Science', 'Study skills'], audience: ['Elementary', 'Junior high school'], accessSteps: ['Ask the organizer for the next session topic.', 'Bring textbooks and your assignment instructions.', 'Take note of questions to follow up with your teacher.'], schedule: 'Illustrative Saturday morning sessions', amenities: ['Group learning', 'Homework planning', 'Peer encouragement'], contactNotes: 'Demo data; availability and supervision are not verified.', website: '', icon: 'Users', color: 'lavender' },
  { id: 'r8', title: 'Philippine Open Learning Guides', category: 'Online Materials', region: 'National Capital Region', city: 'Online', organization: 'Open Learning Guide Directory', shortDescription: 'A starting point for finding official curriculum and learning references.', description: 'A guide to looking for trustworthy public learning materials, including curriculum references and school announcements from recognized education organizations.', cost: 'Free', mode: 'Online', subjects: ['All subjects', 'Curriculum reference', 'Study planning'], audience: ['Elementary', 'Junior high school', 'Senior high school', 'College'], accessSteps: ['Visit the linked official education site.', 'Search for the subject and grade level you need.', 'Check the publication date and source before using material.'], schedule: 'Online access varies by linked provider', amenities: ['Official-source discovery', 'Grade-level search tips', 'Study-planning guidance'], contactNotes: 'EduLoop does not own or guarantee third-party resources. Verify current pages and terms.', website: 'https://www.deped.gov.ph/', icon: 'Globe', color: 'peach' },
  { id: 'r9', title: 'Baguio Quiet Study Nook', category: 'Study Spaces', region: 'Cordillera Administrative Region', city: 'Baguio City, Benguet', organization: 'Student Study Support Group', shortDescription: 'A sample quiet-area directory entry for individual reading and review.', description: 'This concept highlights the value of quiet public learning areas and gives students a checklist for confirming seating, opening hours and access rules.', cost: 'Varies', mode: 'In person', subjects: ['Independent study', 'Reading', 'Exam preparation'], audience: ['Senior high school', 'College'], accessSteps: ['Confirm the venue and its current operating hours.', 'Ask whether a student ID or reservation is required.', 'Respect occupancy rules and shared-space guidelines.'], schedule: 'Venue-specific; verify before visiting', amenities: ['Quiet seating checklist', 'Study planning guide', 'Solo review space'], contactNotes: 'Fictional listing. No venue partnership is claimed.', website: '', icon: 'Coffee', color: 'mint' },
  { id: 'r10', title: 'K-12 English Practice Desk', category: 'Tutoring', region: 'Central Luzon', city: 'San Fernando, Pampanga', organization: 'Language Practice Volunteers', shortDescription: 'Reading comprehension, vocabulary and writing practice in small groups.', description: 'A proposed learning activity for students who want to build reading confidence and improve short written responses with peer feedback.', cost: 'Free', mode: 'Hybrid', subjects: ['English', 'Reading comprehension', 'Writing', 'Vocabulary'], audience: ['Elementary', 'Junior high school'], accessSteps: ['Pick a practice set that matches your level.', 'Complete the short reading activity.', 'Share one question or sentence for feedback.'], schedule: 'Sample weekly session; confirm with the organizer', amenities: ['Practice sheets', 'Vocabulary cards', 'Peer review'], contactNotes: 'Fictional demo service; not an actual scheduled program.', website: '', icon: 'BookOpen', color: 'sky' },
  { id: 'r11', title: 'Community Computer Access Guide', category: 'Libraries', region: 'Zamboanga Peninsula', city: 'Zamboanga City, Zamboanga del Sur', organization: 'Digital Access Map Project', shortDescription: 'A checklist for discovering safe and affordable computer access nearby.', description: 'This directory entry helps learners identify questions to ask libraries, learning centers and community organizations before using shared computers.', cost: 'Varies', mode: 'In person', subjects: ['Computer access', 'Online research', 'Digital literacy'], audience: ['Senior high school', 'College', 'Adult learners'], accessSteps: ['Ask a provider about computer-use rules and fees.', 'Check whether printing or internet access is included.', 'Log out of accounts and avoid saving passwords on shared devices.'], schedule: 'Depends on the chosen provider', amenities: ['Provider comparison checklist', 'Digital privacy reminders', 'Access planning'], contactNotes: 'This is a discovery guide, not a confirmed computer facility.', website: '', icon: 'Monitor', color: 'lavender' },
  { id: 'r12', title: 'Cagayan Valley Science Review Group', category: 'Tutoring', region: 'Cagayan Valley', city: 'Tuguegarao City, Cagayan', organization: 'Science Peer Review Group', shortDescription: 'Practice-based support for science concepts and exam review.', description: 'A study-group concept where students review difficult ideas using diagrams, flashcards and short explanations rather than memorizing answers only.', cost: 'Free', mode: 'Online', subjects: ['General science', 'Biology', 'Chemistry basics', 'Physics basics'], audience: ['Junior high school', 'Senior high school'], accessSteps: ['Choose the next review topic.', 'Prepare one question and a short summary.', 'Join the scheduled call using a private, trusted link.'], schedule: 'Sample online sessions on weekends', amenities: ['Flashcard prompts', 'Concept maps', 'Group Q&A'], contactNotes: 'Fictional. Never share login credentials or private personal information in open group links.', website: '', icon: 'FlaskConical', color: 'peach' },
  { id: 'r13', title: 'Caraga Local History Shelf', category: 'Libraries', region: 'Caraga', city: 'Butuan City, Agusan del Norte', organization: 'Local History Reading Circle', shortDescription: 'A themed resource shelf concept for local history and culture studies.', description: 'A curated shelf idea for students exploring community history, local literature and cultural heritage through print and public resources.', cost: 'Free', mode: 'In person', subjects: ['Araling Panlipunan', 'History', 'Culture', 'Reading'], audience: ['Elementary', 'Junior high school', 'Senior high school'], accessSteps: ['Ask a library or local learning center about relevant collections.', 'Use author, title and publication information in your notes.', 'Check source reliability and acknowledge sources in assignments.'], schedule: 'Provider-specific', amenities: ['Local history prompts', 'Source evaluation checklist', 'Reading recommendations'], contactNotes: 'Illustrative directory concept; no specific institution partnership is claimed.', website: '', icon: 'Library', color: 'mint' },
  { id: 'r14', title: 'Inclusive Learning Resource Guide', category: 'Online Materials', region: 'MIMAROPA', city: 'Online', organization: 'Accessible Study Guide Project', shortDescription: 'Practical tips for finding readable, captioned and assistive-friendly study content.', description: 'A guide concept that encourages users to check captions, readable document formats, keyboard accessibility and alternative explanations when choosing learning materials.', cost: 'Free', mode: 'Online', subjects: ['Accessibility', 'Study skills', 'Digital learning'], audience: ['All learners', 'Teachers', 'Families'], accessSteps: ['Identify the format that supports your learning needs.', 'Check captions, text size, contrast and document structure.', 'Use an alternative source if the material is difficult to access.'], schedule: 'Self-paced', amenities: ['Accessibility checklist', 'Format selection tips', 'Inclusive learning reminders'], contactNotes: 'A demo guide, not medical or specialist advice. Ask your school about available accommodations.', website: '', icon: 'Accessibility', color: 'sky' },
  { id: 'r15', title: 'Island Learners Study Network', category: 'Study Spaces', region: 'Eastern Visayas', city: 'Ormoc City, Leyte', organization: 'Island Learners Network', shortDescription: 'A peer-planning concept for learners balancing schoolwork and travel.', description: 'A flexible study-network model for students who coordinate group tasks, offline materials and shared study plans across different schedules.', cost: 'Free', mode: 'Hybrid', subjects: ['Study skills', 'Project planning', 'General study'], audience: ['Senior high school', 'College'], accessSteps: ['Agree on a realistic study goal with your group.', 'Share only class materials that you have permission to distribute.', 'Keep a local copy of notes for periods with limited connectivity.'], schedule: 'Flexible group scheduling', amenities: ['Study plan templates', 'Offline-first tips', 'Group accountability'], contactNotes: 'Fictional concept. Do not post private schedules or personal addresses publicly.', website: '', icon: 'Users', color: 'lavender' },
];

const materialRows: Array<Omit<Material, 'ownerId' | 'ownerName' | 'ownerRole' | 'status' | 'createdAt'>> = [
  { id: 'm1', title: 'Basic Scientific Calculator', category: 'Calculators', condition: 'Good', exchangeType: 'Borrow', region: 'Central Visayas', city: 'Cebu City, Cebu', description: 'A working basic scientific calculator for math practice, quizzes and review sessions. Please test it at pickup.', includedItems: ['Scientific calculator', 'Protective cover'], pickupNotes: 'Arrange a safe public campus or community pickup. Exact location is agreed privately after approval.', availability: 'Available', icon: 'Calculator', color: 'sky' },
  { id: 'm2', title: 'Senior High Biology Textbook', category: 'Textbooks', condition: 'Like new', exchangeType: 'Donate', region: 'Eastern Visayas', city: 'Tacloban City, Leyte', description: 'A used biology reference book with clean pages and a few notes on the inside cover. Useful as a supplementary reference.', includedItems: ['Biology textbook'], pickupNotes: 'Coordinate a public pickup point with the owner. Check the edition and syllabus fit before accepting.', availability: 'Available', icon: 'BookOpen', color: 'mint' },
  { id: 'm3', title: 'Complete Geometry Set', category: 'School Supplies', condition: 'Good', exchangeType: 'Swap', region: 'Western Visayas', city: 'Iloilo City, Iloilo', description: 'Geometry tools for classroom drawing and measurement. The set has been used but is ready for another student.', includedItems: ['Compass', 'Protractor', 'Ruler', 'Set square'], pickupNotes: 'Swap for any clean school supplies in usable condition; agree on details before meeting.', availability: 'Available', icon: 'PencilRuler', color: 'peach' },
  { id: 'm4', title: 'Beginner Programming Books', category: 'Books', condition: 'Good', exchangeType: 'Donate', region: 'National Capital Region', city: 'Quezon City, Metro Manila', description: 'Two beginner-friendly books on programming logic and introductory web concepts. Some examples may use older software versions.', includedItems: ['Programming logic book', 'Introductory web book'], pickupNotes: 'Check whether the examples are suitable for your course. Public meetup only; never post a home address.', availability: 'Available', icon: 'Laptop', color: 'lavender' },
  { id: 'm5', title: 'Art Paper and Coloring Bundle', category: 'School Supplies', condition: 'New', exchangeType: 'Donate', region: 'Bicol Region', city: 'Legazpi City, Albay', description: 'A small collection of unused art paper and coloring materials for class projects, posters or visual reports.', includedItems: ['Colored paper', 'Pencils', 'Crayons'], pickupNotes: 'Bundle will be given as one set. Ask about approximate quantity before arranging pickup.', availability: 'Available', icon: 'Palette', color: 'peach' },
  { id: 'm6', title: 'USB Keyboard for Practice', category: 'Electronics', condition: 'Good', exchangeType: 'Borrow', region: 'Davao Region', city: 'Davao City, Davao del Sur', description: 'A wired USB keyboard for basic typing and computer-lab practice. Test with your device before confirming the handoff.', includedItems: ['Wired USB keyboard'], pickupNotes: 'Borrowing duration and return date should be agreed in the request conversation.', availability: 'Available', icon: 'Keyboard', color: 'sky' },
  { id: 'm7', title: 'Pocket Dictionary Set', category: 'Books', condition: 'Well-used', exchangeType: 'Donate', region: 'Central Luzon', city: 'Angeles City, Pampanga', description: 'A well-used English–Filipino reference pair. Covers have marks but pages are readable.', includedItems: ['English pocket dictionary', 'Filipino pocket dictionary'], pickupNotes: 'Check condition photos in person if available and ensure the set meets your needs.', availability: 'Available', icon: 'BookOpen', color: 'mint' },
  { id: 'm8', title: 'Reusable Notebook Pack', category: 'School Supplies', condition: 'New', exchangeType: 'Swap', region: 'Northern Mindanao', city: 'Cagayan de Oro City, Misamis Oriental', description: 'Unused notebooks that can be exchanged for other school supplies or distributed within a study group.', includedItems: ['Three notebooks'], pickupNotes: 'Confirm notebook size and count before meeting.', availability: 'Available', icon: 'NotebookPen', color: 'lavender' },
  { id: 'm9', title: 'USB Flash Drive — 16 GB', category: 'Electronics', condition: 'Good', exchangeType: 'Borrow', region: 'Cordillera Administrative Region', city: 'Baguio City, Benguet', description: 'A basic flash drive for temporary school-file transfer. Scan files and keep a backup when using removable storage.', includedItems: ['16 GB USB flash drive'], pickupNotes: 'Never store sensitive personal information on a shared drive. Agree on a return date.', availability: 'Available', icon: 'Usb', color: 'peach' },
  { id: 'm10', title: 'Earth Science Review Notes', category: 'Notes & Reviewers', condition: 'Good', exchangeType: 'Donate', region: 'Cagayan Valley', city: 'Tuguegarao City, Cagayan', description: 'Organized summary notes with diagrams and key terms for introductory earth science review. Use alongside your teacher’s materials.', includedItems: ['Printed review notes', 'Diagram sheets'], pickupNotes: 'Confirm the topics and curriculum version before relying on the notes for a test.', availability: 'Available', icon: 'FileText', color: 'mint' },
  { id: 'm11', title: 'Drawing Tablet for Digital Art', category: 'Electronics', condition: 'Like new', exchangeType: 'Borrow', region: 'Zamboanga Peninsula', city: 'Zamboanga City, Zamboanga del Sur', description: 'A small entry-level drawing tablet for digital illustrations and class visuals. Compatibility varies by computer.', includedItems: ['Drawing tablet', 'USB cable', 'Stylus'], pickupNotes: 'Confirm operating-system compatibility before borrowing and agree on safe handling.', availability: 'Reserved', icon: 'PenTool', color: 'sky' },
  { id: 'm12', title: 'Filipino Literature Anthology', category: 'Textbooks', condition: 'Good', exchangeType: 'Swap', region: 'Caraga', city: 'Butuan City, Agusan del Norte', description: 'A literature anthology for classroom reading and discussion, with highlighting in several chapters.', includedItems: ['Literature anthology'], pickupNotes: 'Swap for another literature or language reference in readable condition.', availability: 'Available', icon: 'BookOpen', color: 'lavender' },
  { id: 'm13', title: 'Lab Coat — Small / Medium', category: 'Uniforms & Lab Gear', condition: 'Good', exchangeType: 'Donate', region: 'MIMAROPA', city: 'Calapan City, Oriental Mindoro', description: 'A clean lab coat for educational laboratory activities. Confirm school requirements and fit before arranging pickup.', includedItems: ['Lab coat'], pickupNotes: 'Recipient should check sizing and any school-specific safety requirements.', availability: 'Available', icon: 'FlaskConical', color: 'peach' },
  { id: 'm14', title: 'Basic Headphones', category: 'Electronics', condition: 'Good', exchangeType: 'Borrow', region: 'Eastern Visayas', city: 'Ormoc City, Leyte', description: 'Wired headphones useful for language listening activities and online lessons in shared environments.', includedItems: ['Wired headphones'], pickupNotes: 'Test sound and comfort at pickup; agree on a reasonable return date.', availability: 'Available', icon: 'Headphones', color: 'mint' },
  { id: 'm15', title: 'Pencil Case and Ruler Kit', category: 'School Supplies', condition: 'Like new', exchangeType: 'Donate', region: 'Central Visayas', city: 'Lapu-Lapu City, Cebu', description: 'A compact school-supply kit containing everyday writing and measuring tools. Good for a learner starting a new term.', includedItems: ['Pencil case', 'Pencils', 'Ruler', 'Eraser'], pickupNotes: 'Coordinate handoff in a public and mutually convenient place.', availability: 'Available', icon: 'PencilRuler', color: 'sky' },
];

export function makeInitialState(): AppState {
  const resources: Resource[] = resourceRows.map((r, i) => ({
    ...r,
    createdBy: i % 2 === 0 ? 'u-paolo' : 'u-mika',
    createdByName: i % 2 === 0 ? 'Paolo Reyes' : 'Mika Santos',
    status: 'Approved',
    createdAt: `2026-09-${String(2 + i).padStart(2, '0')}T08:00:00.000Z`,
  }));
  resources.push({
    id: 'r-pending-demo', title: 'Community Coding Study Group', category: 'Tutoring', region: 'Central Visayas', city: 'Lapu-Lapu City, Cebu', organization: 'Student Volunteer Group',
    shortDescription: 'A proposed peer-learning circle for beginner programming students.', description: 'A new community-created resource submitted for administrator review. This listing is fictional and is awaiting approval in the demo.',
    cost: 'Free', mode: 'Hybrid', subjects: ['Programming basics', 'Problem-solving'], audience: ['Senior high school', 'College'], accessSteps: ['Wait for listing approval.', 'Review the approved schedule and joining instructions.'], schedule: 'To be announced after review', amenities: ['Peer practice', 'Beginner questions'], contactNotes: 'Demo pending listing.', website: '', createdBy: 'u-paolo', createdByName: 'Paolo Reyes', status: 'Pending Review', createdAt: now, icon: 'Code2', color: 'lavender',
  });
  const materials: Material[] = materialRows.map((m, i) => ({
    ...m,
    ownerId: i % 3 === 0 ? 'u-paolo' : i % 3 === 1 ? 'u-mika' : 'u-paolo',
    ownerName: i % 3 === 0 || i % 3 === 2 ? 'Paolo Reyes' : 'Mika Santos',
    ownerRole: i % 3 === 0 || i % 3 === 2 ? 'Contributor' : 'Student',
    status: 'Approved',
    createdAt: `2026-09-${String(3 + i).padStart(2, '0')}T08:00:00.000Z`,
  }));
  materials.push({
    id: 'm-pending-demo', title: 'Introduction to Web Design Notes', category: 'Notes & Reviewers', condition: 'Good', exchangeType: 'Donate', region: 'Central Visayas', city: 'Cebu City, Cebu',
    description: 'Printed notes and examples for a first look at HTML and CSS. Waiting for moderator review.', includedItems: ['Printed notes', 'Practice worksheet'], pickupNotes: 'Pickup details will be shared after approval.', availability: 'Available', ownerId: 'u-paolo', ownerName: 'Paolo Reyes', ownerRole: 'Contributor', status: 'Pending Review', createdAt: now, icon: 'FileText', color: 'mint',
  });
  const requests: RequestRecord[] = [{
    id: 'q1', materialId: 'm1', materialTitle: 'Basic Scientific Calculator', requesterId: 'u-mika', requesterName: 'Mika Santos', ownerId: 'u-paolo', ownerName: 'Paolo Reyes', message: 'I would like to borrow this for my upcoming math review. I can return it after the review session.', status: 'Pending', createdAt: '2026-10-10T07:30:00.000Z', updatedAt: '2026-10-10T07:30:00.000Z',
  }];
  return {
    users: initialUsers,
    currentUserId: null,
    resources,
    materials,
    requests,
    notifications: [
      { id: 'n1', userId: 'u-mika', title: 'Request sent', message: 'Your request for Basic Scientific Calculator is waiting for a response.', createdAt: '2026-10-10T07:30:00.000Z', read: false },
      { id: 'n2', userId: 'u-paolo', title: 'New material request', message: 'Mika Santos requested your Basic Scientific Calculator.', createdAt: '2026-10-10T07:30:00.000Z', read: false },
      { id: 'n3', userId: 'u-lea', title: 'Items need review', message: 'There are sample submissions awaiting administrator review.', createdAt: now, read: false },
    ],
    reports: [
      { id: 'rep1', targetType: 'Material', targetId: 'm9', targetTitle: 'USB Flash Drive — 16 GB', reason: 'Demo report', details: 'Sample report record included to demonstrate the review workflow. This is fictional.', reporterName: 'Demo learner', status: 'Open', createdAt: now },
    ],
    activity: [
      { id: 'a1', message: 'Demo data loaded for the EduLoop prototype.', createdAt: now },
      { id: 'a2', message: 'A sample resource was submitted and is awaiting review.', createdAt: now },
    ],
    recentlyViewed: {},
    savedItems: {},
  };
}

export const resourceCategories = ['Libraries', 'Study Spaces', 'Tutoring', 'Online Materials'];
export const materialCategories = ['Textbooks', 'Books', 'Calculators', 'School Supplies', 'Electronics', 'Notes & Reviewers', 'Uniforms & Lab Gear'];
export const philippineRegions = [
  'National Capital Region', 'Cordillera Administrative Region', 'Ilocos Region', 'Cagayan Valley', 'Central Luzon', 'CALABARZON', 'MIMAROPA', 'Bicol Region',
  'Western Visayas', 'Central Visayas', 'Eastern Visayas', 'Zamboanga Peninsula', 'Northern Mindanao', 'Davao Region', 'SOCCSKSARGEN', 'Caraga', 'Bangsamoro Autonomous Region in Muslim Mindanao',
];
