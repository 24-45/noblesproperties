/**
 * Firebase Configuration for ALIC Campaign Management
 * نظام إدارة حملة ALIC الإعلامية
 */

// Firebase Configuration - Replace with your project credentials
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();

// Initialize Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Collection References
const COLLECTIONS = {
    TASKS: 'campaign_tasks',
    APPROVALS: 'approvals',
    USERS: 'users',
    ACTIVITY_LOG: 'activity_log',
    BUDGET: 'budget_tracking',
    KPI: 'kpi_metrics',
    ADMIN_SETTINGS: 'admin_settings'
};

// User Roles with Permissions
const ROLES = {
    SUPER_ADMIN: {
        name: 'super_admin',
        label: 'المدير العام',
        level: 100,
        permissions: ['all']
    },
    ADMIN: {
        name: 'admin',
        label: 'مدير النظام',
        level: 90,
        permissions: ['manage_users', 'manage_tasks', 'approve_final', 'publish', 'view_reports', 'manage_budget']
    },
    MANAGER: {
        name: 'manager',
        label: 'مدير المشروع',
        level: 70,
        permissions: ['manage_tasks', 'approve_final', 'publish', 'view_reports', 'manage_budget']
    },
    SUPERVISOR: {
        name: 'supervisor',
        label: 'مشرف',
        level: 50,
        permissions: ['review_tasks', 'approve_initial', 'view_reports']
    },
    EDITOR: {
        name: 'editor',
        label: 'محرر',
        level: 30,
        permissions: ['create_tasks', 'edit_own_tasks', 'submit_review']
    },
    VIEWER: {
        name: 'viewer',
        label: 'مشاهد',
        level: 10,
        permissions: ['view_tasks']
    }
};

// Task Status
const TASK_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    PENDING_REVIEW: 'pending_review',
    PENDING_APPROVAL: 'pending_approval',
    APPROVED: 'approved',
    PUBLISHED: 'published',
    REJECTED: 'rejected'
};

// Approval Levels
const APPROVAL_LEVELS = {
    LEVEL_1: { role: 'editor', title: 'إنشاء المحتوى' },
    LEVEL_2: { role: 'supervisor', title: 'مراجعة المشرف' },
    LEVEL_3: { role: 'manager', title: 'موافقة المدير' },
    LEVEL_4: { role: 'admin', title: 'الموافقة النهائية' }
};

// Allowed Admin Emails (يمكن إضافة البريد الإلكتروني للمسؤولين هنا)
const ADMIN_EMAILS = [
    'admin@nobles.jo',
    'manager@nobles.jo'
    // أضف بريدك الإلكتروني هنا
];

console.log('✅ Firebase Configuration Loaded with Google Auth');
