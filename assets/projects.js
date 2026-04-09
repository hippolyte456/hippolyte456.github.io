/**
 * projects.js — source de données des projets
 * Modifier ce fichier pour mettre à jour la page.
 * Format miroir des fichiers .proj
 */
const PROJECTS = [
  {
    category : 'lifestyle',
    icon     : '🏡',
    title    : 'OpenHabitat',
    what: {
      name        : 'OpenHabitat',
      description : '',
      domain      : 'lifestyle | technics',
      type        : 'software | construction',
    },
    why: { economy_driven: 0, ego_driven: 0, commun_good_driven: 0, pleasure_driven: 0 },
    how: { time_per_week: '', duration: '', persons: '', skills: '', tools: '', cost: '', notes: '' },
    state: { status: 'current', progress: 0, steps: [] },
  },
  {
    category : 'lifestyle',
    icon     : '⛺',
    title    : 'Yourte',
    what: {
      name        : 'Heligo Yourte',
      description : '',
      domain      : 'lifestyle',
      type        : 'construction',
    },
    why: { economy_driven: 0, ego_driven: 0, commun_good_driven: 0, pleasure_driven: 0 },
    how: { time_per_week: '', duration: '', persons: '', skills: '', tools: '', cost: '', notes: '' },
    state: { status: 'current', progress: 0, steps: [] },
  },
  {
    category : 'passion',
    icon     : '🌊',
    title    : 'Wing4All',
    what: {
      name        : 'Wing4All',
      description : '',
      domain      : 'lifestyle',
      type        : 'other',
    },
    why: { economy_driven: 0, ego_driven: 0, commun_good_driven: 0, pleasure_driven: 0 },
    how: { time_per_week: '', duration: '', persons: '', skills: '', tools: '', cost: '', notes: '' },
    state: { status: 'current', progress: 0, steps: [] },
  },
  {
    category : 'psychiatrie',
    icon     : '🧠',
    title    : 'DeepConnexion',
    what: {
      name        : 'DeepConnexion',
      description : '',
      domain      : 'science | psychiatrie',
      type        : 'other',
    },
    why: { economy_driven: 0, ego_driven: 0, commun_good_driven: 0, pleasure_driven: 0 },
    how: { time_per_week: '', duration: '', persons: '', skills: '', tools: '', cost: '', notes: '' },
    state: { status: 'current', progress: 0, steps: [] },
  },
];
