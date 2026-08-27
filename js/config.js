/**
 * Single source of truth for the deck.
 * Each entry becomes one full-screen slide + one icon in the nav rail.
 * `file` is loaded from /sections at runtime, so content lives in its own file.
 */
export const SECTIONS = [
  { id: 'top',     file: 'hero.html',         label: 'Home',         icon: 'home',   cls: 'hero' },
  { id: 'about',   file: 'about.html',        label: 'About Me',  icon: 'spark'   },
  { id: 'work',    file: 'experience.html',   label: 'Experience',   icon: 'brief'   },
  { id: 'projects',file: 'projects.html',     label: 'Projects',     icon: 'layers'  },
  { id: 'skills',  file: 'skills.html',       label: 'Skills',       icon: 'code'    },
  { id: 'awards',  file: 'achievements.html', label: 'Achievements', icon: 'trophy'  },
  { id: 'certs',   file: 'certificates.html', label: 'Certificates', icon: 'badge'   },
  { id: 'activity',file: 'activity.html',     label: 'Activity & AI', icon: 'terminal'},
  { id: 'contact', file: 'contact.html',      label: 'Contact',      icon: 'mail', cls: 'contact' }
];

/** Stroke-only 24x24 icon paths — inherit colour from the link. */
export const ICONS = {
  home:  '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
  spark: '<path d="M12 2.5 14.2 9 21 11.2 14.2 13.4 12 20 9.8 13.4 3 11.2 9.8 9z"/><path d="M18.5 3.5v3M17 5h3"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.5A2 2 0 0 1 10.5 3.5h3a2 2 0 0 1 2 2V7"/><path d="M3 12.5h18"/>',
  layers:'<path d="M12 3 3 7.8l9 4.8 9-4.8z"/><path d="m3 12.4 9 4.8 9-4.8"/><path d="m3 16.9 9 4.8 9-4.8"/>',
  code:  '<path d="m8.5 8-5 4 5 4"/><path d="m15.5 8 5 4-5 4"/><path d="m13.5 4-3 16"/>',
  trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4V7a3.5 3.5 0 0 0 3.5 3.5"/><path d="M17 5.5h3V7a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 14v3.5"/><path d="M8.5 20.5h7"/><path d="M9.5 17.5h5l1 3h-7z"/>',
  badge: '<circle cx="12" cy="9.5" r="5.5"/><path d="M9 14.5 7.5 21.5l4.5-2.4 4.5 2.4L15 14.5"/>',
  terminal:'<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
  mail:  '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.6 8.2 6 8.2-6"/>'
};

/** Rotating strap-line under the name. */
export const TYPED_LINES = [
  'Software Development Engineer @ Wasp3D',
  'Real-time graphics · C++ / DirectX 12',
  'Full-stack engineer · MERN',
  '900+ DSA problems solved'
];
