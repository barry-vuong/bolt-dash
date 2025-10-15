import { Wizard } from '../types';

export const wizards: Wizard[] = [
  {
    id: 'loe-generator',
    name: 'LOE Generator',
    icon: 'Calculator',
    description: 'Quickly create level-of-effort estimates for projects'
  },
  {
    id: 'budget-alerts',
    name: 'Budget & Expenses Alerts',
    icon: 'AlertTriangle',
    description: 'Set thresholds, receive notifications, flag anomalies'
  },
  {
    id: 'contract-redliner',
    name: 'Contract Redliner',
    icon: 'FileEdit',
    description: 'Upload contracts and get tracked change suggestions'
  },
  {
    id: 'policy-drafting',
    name: 'Policy Drafting',
    icon: 'FileText',
    description: 'Create internal policy drafts with compliant language'
  },
];