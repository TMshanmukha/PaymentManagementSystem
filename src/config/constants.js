// Central place for brand/config so it's easy to replace later (spec section 8).
export const APP_NAME = 'VVSLedger';
export const APP_SUBTITLE = 'School & Tuition Management';

export const ROLES = {
  ADMIN: 'ADMIN',
  SCHOOL_ACCOUNTANT: 'SCHOOL_ACCOUNTANT',
  TUITION_ACCOUNTANT: 'TUITION_ACCOUNTANT',
};

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  SCHOOL_ACCOUNTANT: 'School Accountant',
  TUITION_ACCOUNTANT: 'Tuition Accountant',
};

export const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  SCHOOL_ACCOUNTANT: '/school/dashboard',
  TUITION_ACCOUNTANT: '/tuition/dashboard',
};

// Which student_type an accountant role is scoped to (mirrors backend scopeForRole).
export const ROLE_SCOPE = {
  SCHOOL_ACCOUNTANT: 'SCHOOL',
  TUITION_ACCOUNTANT: 'TUITION',
};
