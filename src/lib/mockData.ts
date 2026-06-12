// Static mock data for screens without a live API (Schedule, Notes, People, MyWork, Settings)

export interface MockPerson {
  id: string
  initials: string
  name: string
  role: string
  email: string
  color: string
  activeTasks: number
}

export const PEOPLE: MockPerson[] = [
  { id: 'jl', initials: 'JL', name: 'Jamie Lee', role: 'Product Designer', email: 'jamie@popcreations.com', color: '#4F9DF7', activeTasks: 3 },
  { id: 'mr', initials: 'MR', name: 'Marco Ruiz', role: 'Licensing Manager', email: 'marco@popcreations.com', color: '#6B54C9', activeTasks: 3 },
  { id: 'kp', initials: 'KP', name: 'Kat Park', role: 'Designer', email: 'kat@popcreations.com', color: '#3F9A50', activeTasks: 3 },
  { id: 'sb', initials: 'SB', name: 'Sofia Brown', role: 'Sales Lead', email: 'sofia@popcreations.com', color: '#D24B83', activeTasks: 4 },
  { id: 'an', initials: 'AN', name: 'Alex Nguyen', role: 'Production Manager', email: 'alex@popcreations.com', color: '#DB6645', activeTasks: 2 },
  { id: 'mm', initials: 'MM', name: 'Maya Mills', role: 'Art Director', email: 'maya@popcreations.com', color: '#2589AB', activeTasks: 5 },
  { id: 'dt', initials: 'DT', name: 'Dana Torres', role: 'Account Manager', email: 'dana@popcreations.com', color: '#239281', activeTasks: 1 },
  { id: 'ra', initials: 'RA', name: 'Ryan Ashe', role: 'Sales', email: 'ryan@popcreations.com', color: '#C8942A', activeTasks: 2 },
]

export interface MockNote {
  id: string
  title: string
  preview: string
  date: string
  body: string
}

export const NOTES: MockNote[] = [
  {
    id: 'n1',
    title: 'Disney · Encanto Collection Brief',
    preview: 'Color palette approved by licensors. Key characters: Mirabel, Luisa, Isabela…',
    date: '2d ago',
    body: '# Disney · Encanto Collection Brief\n\nColor palette approved by licensors. Key characters: Mirabel, Luisa, Isabela.\n\n## Deliverables\n\n- Artwork files by June 20\n- Licensor approval needed before sampling\n- Factory hand-off: July 5\n\nOrganize content logically, with a clear hierarchy that makes it easy to find information quickly.',
  },
  {
    id: 'n2',
    title: 'Q4 Marvel Planning Notes',
    preview: 'Spider-Man SKUs confirmed for Target. Black Panther TBD pending licensor…',
    date: '5d ago',
    body: '# Q4 Marvel Planning Notes\n\nSpider-Man SKUs confirmed for Target. Black Panther TBD pending licensor approval.\n\n## Key Dates\n\n- On-shelf: November 1\n- Sampling deadline: August 15\n- Artwork freeze: July 20',
  },
  {
    id: 'n3',
    title: 'Factory Audit — Guangzhou',
    preview: 'Facility passed social compliance audit. Minor fire safety issues noted…',
    date: '1w ago',
    body: '# Factory Audit — Guangzhou\n\nFacility passed social compliance audit. Minor fire safety issues noted and addressed.\n\n## Follow-up\n\n- Re-audit scheduled Q3\n- Updated certification on file',
  },
  {
    id: 'n4',
    title: 'Holiday Seasonal Line — Kick-off',
    preview: 'Snowflake + Nordic theme approved. 12 SKUs planned across kitchen and textiles…',
    date: '2w ago',
    body: '# Holiday Seasonal Line — Kick-off\n\nSnowflake + Nordic theme approved. 12 SKUs planned across kitchen and textiles.\n\n## Key Decisions\n\n- No licensed IP this season\n- POP Creations original designs only\n- Price points: $12.99–$34.99',
  },
]

export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type Category = 'textiles' | 'frames' | 'kitchen' | 'lighting' | 'plush' | 'candle' | 'storage' | 'seasonal' | 'bath'

export interface MockTask {
  id: string
  stage: string
  title: string
  licensor: string
  category: Category
  priority: Priority
  time: string
  due: string | null
  dueOver: boolean
  checklist: { done: number; total: number }
  comments: number
  attach: number
  pill: string | null
  assignees: string[]
  buyer?: string
  factory?: string
  retailer?: string
  dueLicensor?: string
  description?: string
}

export const TASKS: MockTask[] = [
  // Concept
  { id: 't1', stage: 'Concept', title: 'Encanto throw pillow set', licensor: 'Disney', category: 'textiles', priority: 'normal', time: '2:00h', due: '3d left', dueOver: false, checklist: { done: 1, total: 3 }, comments: 2, attach: 1, pill: null, assignees: ['jl', 'mm'], description: 'Initial concept for Encanto-themed throw pillow set.' },
  { id: 't2', stage: 'Concept', title: 'Bluey plush mini set (3-pack)', licensor: 'Nickelodeon', category: 'plush', priority: 'high', time: '3:00h', due: '5d left', dueOver: false, checklist: { done: 0, total: 4 }, comments: 1, attach: 0, pill: 'Feedback', assignees: ['jl'], description: 'Mini plush set for Bluey characters.' },
  { id: 't3', stage: 'Concept', title: 'Nordic holiday candle trio', licensor: 'Seasonal', category: 'candle', priority: 'low', time: '1:30h', due: null, dueOver: false, checklist: { done: 0, total: 2 }, comments: 0, attach: 0, pill: null, assignees: ['mm'], description: 'Holiday-themed candle set with Nordic aesthetic.' },
  // In Development
  { id: 't4', stage: 'In Development', title: 'Mandalorian framed canvas wall art', licensor: 'Lucasfilm', category: 'frames', priority: 'high', time: '4:00h', due: '6 days left', dueOver: false, checklist: { done: 2, total: 4 }, comments: 3, attach: 1, pill: null, assignees: ['mr', 'kp'], buyer: 'Target', factory: 'Artisan Co.', retailer: 'Target', dueLicensor: 'June 30', description: 'Product development task for the Lucasfilm line. Confirm artwork, dimensions, and licensor approvals before advancing to the next pipeline stage. Reference the catalog sales sheet and final spec files prior to factory hand-off.' },
  { id: 't5', stage: 'In Development', title: 'Hello Kitty bath towel set', licensor: 'Sanrio', category: 'bath', priority: 'urgent', time: '3:30h', due: '2d left', dueOver: false, checklist: { done: 3, total: 5 }, comments: 4, attach: 2, pill: 'ASAP', assignees: ['kp', 'sb'], description: 'Hello Kitty licensed bath towel set.' },
  { id: 't6', stage: 'In Development', title: 'Spider-Man storage bins (3-size)', licensor: 'Marvel', category: 'storage', priority: 'normal', time: '2:30h', due: '10d left', dueOver: false, checklist: { done: 1, total: 3 }, comments: 1, attach: 0, pill: null, assignees: ['an'], description: 'Spider-Man themed storage bin set.' },
  // Licensor Review
  { id: 't7', stage: 'Licensor Review', title: 'Isabela floral ceramic mug', licensor: 'Disney', category: 'kitchen', priority: 'high', time: '1:00h', due: 'Overdue', dueOver: true, checklist: { done: 4, total: 4 }, comments: 6, attach: 3, pill: 'blocked', assignees: ['mr', 'sb'], description: 'Ceramic mug with Isabela character art.' },
  { id: 't8', stage: 'Licensor Review', title: 'Marvel hero wall decal set', licensor: 'Marvel', category: 'textiles', priority: 'normal', time: '2:00h', due: '8d left', dueOver: false, checklist: { done: 2, total: 3 }, comments: 2, attach: 1, pill: null, assignees: ['jl'], description: 'Wall decal set featuring Marvel heroes.' },
  // Approved
  { id: 't9', stage: 'Approved', title: 'Baby Yoda plush (12")', licensor: 'Lucasfilm', category: 'plush', priority: 'high', time: '5:00h', due: '14 days left', dueOver: false, checklist: { done: 5, total: 6 }, comments: 4, attach: 2, pill: null, assignees: ['an', 'kp'], description: 'Grogu/Baby Yoda 12 inch plush toy.' },
  { id: 't10', stage: 'Approved', title: 'Sanrio kitchen apron', licensor: 'Sanrio', category: 'kitchen', priority: 'normal', time: '1:30h', due: '20d left', dueOver: false, checklist: { done: 3, total: 3 }, comments: 1, attach: 1, pill: null, assignees: ['dt'], description: 'Kitchen apron with Sanrio character print.' },
  // Sampling
  { id: 't11', stage: 'Sampling', title: 'Encanto LED night light', licensor: 'Disney', category: 'lighting', priority: 'normal', time: '3:00h', due: '7d left', dueOver: false, checklist: { done: 4, total: 5 }, comments: 3, attach: 2, pill: null, assignees: ['mm', 'an'], description: 'Encanto-themed LED night light for children\'s rooms.' },
  { id: 't12', stage: 'Sampling', title: 'Groot ceramic planter', licensor: 'Marvel', category: 'kitchen', priority: 'low', time: '2:00h', due: '15d left', dueOver: false, checklist: { done: 2, total: 4 }, comments: 2, attach: 1, pill: null, assignees: ['ra'], description: 'Ceramic planter shaped like Groot.' },
  // Production
  { id: 't13', stage: 'Production', title: 'Star Wars holiday ornament 4-pack', licensor: 'Lucasfilm', category: 'seasonal', priority: 'urgent', time: '6:00h', due: '3d left', dueOver: false, checklist: { done: 8, total: 10 }, comments: 7, attach: 4, pill: 'ASAP', assignees: ['mr', 'dt', 'an'], description: 'Holiday ornament 4-pack with classic Star Wars characters.' },
  { id: 't14', stage: 'Production', title: 'Nick characters bath mat', licensor: 'Nickelodeon', category: 'bath', priority: 'high', time: '4:00h', due: '10d left', dueOver: false, checklist: { done: 6, total: 8 }, comments: 3, attach: 2, pill: null, assignees: ['sb', 'kp'], description: 'Bath mat featuring Nickelodeon character ensemble.' },
  // Shipped
  { id: 't15', stage: 'Shipped', title: 'Encanto tapestry wall hanging', licensor: 'Disney', category: 'textiles', priority: 'normal', time: '5:00h', due: null, dueOver: false, checklist: { done: 6, total: 6 }, comments: 5, attach: 3, pill: null, assignees: ['jl', 'mm'], description: 'Woven tapestry featuring Encanto Casita design.' },
  { id: 't16', stage: 'Shipped', title: 'Marvel Avengers lunchbox', licensor: 'Marvel', category: 'storage', priority: 'normal', time: '2:00h', due: null, dueOver: false, checklist: { done: 4, total: 4 }, comments: 2, attach: 1, pill: null, assignees: ['an'], description: 'Insulated lunchbox with Avengers artwork.' },
]

export const STAGES = ['Concept', 'In Development', 'Licensor Review', 'Approved', 'Sampling', 'Production', 'Shipped']

export const LICENSORS = ['Disney', 'Marvel', 'Lucasfilm', 'Nickelodeon', 'Sanrio', 'Seasonal']

export const LICENSOR_META: Record<string, { gradient: string; letter: string; dotColor: string }> = {
  Disney:       { gradient: 'linear-gradient(135deg,#4F9DF7,#3A5BD0)', letter: 'D', dotColor: '#4F9DF7' },
  Marvel:       { gradient: 'linear-gradient(135deg,#F0564B,#D32A2A)', letter: 'M', dotColor: '#F0564B' },
  Lucasfilm:    { gradient: 'linear-gradient(135deg,#454B5C,#C9A227)', letter: 'L', dotColor: '#C9A227' },
  Nickelodeon:  { gradient: 'linear-gradient(135deg,#FF9F43,#F47B20)', letter: 'N', dotColor: '#FF9F43' },
  Sanrio:       { gradient: 'linear-gradient(135deg,#FF9FC4,#EA6B9C)', letter: 'S', dotColor: '#FF9FC4' },
  Seasonal:     { gradient: 'linear-gradient(135deg,#5BC59C,#2FA37C)', letter: '❄', dotColor: '#5BC59C' },
}

export const CATEGORY_COLORS: Record<string, { bg: string; accent: string }> = {
  textiles: { bg: '#DCEBFC', accent: '#2D7BD0' },
  frames:   { bg: '#E5E0F9', accent: '#6B54C9' },
  kitchen:  { bg: '#FBEFCC', accent: '#C8942A' },
  lighting: { bg: '#FBF2CC', accent: '#D6A626' },
  plush:    { bg: '#FBDAE7', accent: '#D24B83' },
  candle:   { bg: '#FCDDD0', accent: '#DB6645' },
  storage:  { bg: '#D2EFE9', accent: '#239281' },
  seasonal: { bg: '#D9EDDB', accent: '#3F9A50' },
  bath:     { bg: '#DEF1F5', accent: '#2589AB' },
}

export const CATEGORY_ICONS: Record<string, string> = {
  textiles: '🧵',
  frames:   '🖼️',
  kitchen:  '🍴',
  lighting: '💡',
  plush:    '🧸',
  candle:   '🕯️',
  storage:  '📦',
  seasonal: '❄️',
  bath:     '🛁',
}

export const STAGE_COLORS: Record<string, { bg: string; dot: string }> = {
  'Concept':         { bg: '#ECE2F8', dot: '#8B5CF6' },
  'In Development':  { bg: '#DEEBFB', dot: '#3B82F6' },
  'Licensor Review': { bg: '#FBEBD3', dot: '#F59E0B' },
  'Approved':        { bg: '#D8EFE7', dot: '#10B981' },
  'Sampling':        { bg: '#D9F0F5', dot: '#06B6D4' },
  'Production':      { bg: '#FBE2D8', dot: '#EF4444' },
  'Shipped':         { bg: '#DEF0DB', dot: '#22C55E' },
}

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#E0483A',
  high:   '#F2A23C',
  normal: '#4F9DF7',
  low:    '#9AA7BD',
}

export const LICENSOR_PRODUCTS: Record<string, number> = {
  Disney: 42,
  Marvel: 28,
  Lucasfilm: 15,
  Nickelodeon: 11,
  Sanrio: 9,
  Seasonal: 7,
}

export interface MockScheduleTask {
  id: string
  title: string
  licensor: string
  category: Category
  time: string
  day: string
}

export const SCHEDULE_TASKS: Record<string, MockScheduleTask[]> = {
  Mon: [
    { id: 's1', title: 'Encanto throw pillow set', licensor: 'Disney', category: 'textiles', time: '2:00h', day: 'Mon' },
    { id: 's2', title: 'Baby Yoda plush 12"', licensor: 'Lucasfilm', category: 'plush', time: '5:00h', day: 'Mon' },
  ],
  Tue: [
    { id: 's3', title: 'Hello Kitty bath towel set', licensor: 'Sanrio', category: 'bath', time: '3:30h', day: 'Tue' },
    { id: 's4', title: 'Mandalorian canvas wall art', licensor: 'Lucasfilm', category: 'frames', time: '4:00h', day: 'Tue' },
    { id: 's5', title: 'Marvel hero wall decals', licensor: 'Marvel', category: 'textiles', time: '2:00h', day: 'Tue' },
  ],
  Wed: [
    { id: 's6', title: 'Encanto LED night light', licensor: 'Disney', category: 'lighting', time: '3:00h', day: 'Wed' },
  ],
  Thu: [
    { id: 's7', title: 'Star Wars holiday ornament', licensor: 'Lucasfilm', category: 'seasonal', time: '6:00h', day: 'Thu' },
    { id: 's8', title: 'Groot ceramic planter', licensor: 'Marvel', category: 'kitchen', time: '2:00h', day: 'Thu' },
    { id: 's9', title: 'Spider-Man storage bins', licensor: 'Marvel', category: 'storage', time: '2:30h', day: 'Thu' },
  ],
  Fri: [
    { id: 's10', title: 'Sanrio kitchen apron', licensor: 'Sanrio', category: 'kitchen', time: '1:30h', day: 'Fri' },
    { id: 's11', title: 'Nordic holiday candle trio', licensor: 'Seasonal', category: 'candle', time: '1:30h', day: 'Fri' },
  ],
}

export const WAITING_TASKS: MockScheduleTask[] = [
  { id: 'w1', title: 'Bluey plush mini set', licensor: 'Nickelodeon', category: 'plush', time: '3:00h', day: '' },
  { id: 'w2', title: 'Nick characters bath mat', licensor: 'Nickelodeon', category: 'bath', time: '4:00h', day: '' },
  { id: 'w3', title: 'Isabela floral ceramic mug', licensor: 'Disney', category: 'kitchen', time: '1:00h', day: '' },
]
