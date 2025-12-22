/**
 * Authentication Manager with Google Sign-In
 * نظام المصادقة مع تسجيل الدخول عبر Google
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.isInitialized = false;
    }

    // ==========================================
    // تهيئة النظام
    // ==========================================
    init() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    await this.handleUserSignIn(user);
                } else {
                    this.handleUserSignOut();
                }
                this.isInitialized = true;
                resolve(this.currentUser);
            });
        });
    }

    // ==========================================
    // تسجيل الدخول عبر Google
    // ==========================================
    async signInWithGoogle() {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;
            
            // التحقق من وجود المستخدم في قاعدة البيانات
            await this.createOrUpdateUser(user);
            
            showToast(`مرحباً ${user.displayName}!`, 'success');
            closeModal('login-modal');
            
            return user;
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            
            if (error.code === 'auth/popup-closed-by-user') {
                showToast('تم إغلاق نافذة تسجيل الدخول', 'warning');
            } else if (error.code === 'auth/network-request-failed') {
                showToast('خطأ في الاتصال بالإنترنت', 'error');
            } else {
                showToast('حدث خطأ في تسجيل الدخول', 'error');
            }
            throw error;
        }
    }

    // ==========================================
    // تسجيل الدخول بالبريد وكلمة المرور
    // ==========================================
    async signInWithEmail(email, password) {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            showToast('تم تسجيل الدخول بنجاح', 'success');
            closeModal('login-modal');
            return result.user;
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            
            if (error.code === 'auth/user-not-found') {
                showToast('البريد الإلكتروني غير مسجل', 'error');
            } else if (error.code === 'auth/wrong-password') {
                showToast('كلمة المرور غير صحيحة', 'error');
            } else {
                showToast('خطأ في تسجيل الدخول', 'error');
            }
            throw error;
        }
    }

    // ==========================================
    // إنشاء حساب جديد
    // ==========================================
    async createAccount(name, email, password) {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // تحديث اسم المستخدم
            await result.user.updateProfile({
                displayName: name
            });
            
            // إنشاء سجل المستخدم في Firestore
            await this.createUserDocument(result.user, name);
            
            showToast('تم إنشاء الحساب بنجاح', 'success');
            closeModal('register-modal');
            
            return result.user;
        } catch (error) {
            console.error('خطأ في إنشاء الحساب:', error);
            
            if (error.code === 'auth/email-already-in-use') {
                showToast('البريد الإلكتروني مستخدم بالفعل', 'error');
            } else if (error.code === 'auth/weak-password') {
                showToast('كلمة المرور ضعيفة جداً', 'error');
            } else {
                showToast('خطأ في إنشاء الحساب', 'error');
            }
            throw error;
        }
    }

    // ==========================================
    // إنشاء/تحديث سجل المستخدم
    // ==========================================
    async createOrUpdateUser(user) {
        const userRef = db.collection(COLLECTIONS.USERS).doc(user.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            // مستخدم جديد - إنشاء سجل
            await this.createUserDocument(user);
        } else {
            // تحديث آخر تسجيل دخول
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                photoURL: user.photoURL || null
            });
        }
    }

    async createUserDocument(user, displayName = null) {
        const email = user.email;
        const name = displayName || user.displayName || email.split('@')[0];
        
        // تحديد الدور بناءً على البريد الإلكتروني
        let role = 'viewer'; // الدور الافتراضي
        
        if (ADMIN_EMAILS.includes(email)) {
            role = 'admin';
        } else if (email.endsWith('@nobles.jo')) {
            role = 'editor'; // موظفو الشركة يحصلون على دور محرر
        }
        
        const userData = {
            name: name,
            email: email,
            photoURL: user.photoURL || null,
            role: role,
            permissions: this.getPermissionsForRole(role),
            isActive: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            provider: user.providerData[0]?.providerId || 'email'
        };
        
        await db.collection(COLLECTIONS.USERS).doc(user.uid).set(userData);
        
        // تسجيل النشاط
        await this.logActivity('user_created', null, `تم إنشاء حساب جديد: ${name}`);
        
        return userData;
    }

    // ==========================================
    // معالجة تسجيل الدخول
    // ==========================================
    async handleUserSignIn(user) {
        try {
            const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // التحقق من أن الحساب نشط
                if (!userData.isActive) {
                    showToast('حسابك معطل. تواصل مع المسؤول', 'error');
                    await this.signOut();
                    return;
                }
                
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    ...userData
                };
                
                this.userRole = userData.role;
                
                // تحديث واجهة المستخدم
                this.updateUI();
                
            } else {
                // إنشاء سجل للمستخدم الجديد
                await this.createOrUpdateUser(user);
                await this.handleUserSignIn(user); // إعادة التحميل
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدم:', error);
        }
    }

    handleUserSignOut() {
        this.currentUser = null;
        this.userRole = null;
        this.updateUI();
    }

    // ==========================================
    // تسجيل الخروج
    // ==========================================
    async signOut() {
        try {
            await auth.signOut();
            showToast('تم تسجيل الخروج', 'info');
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
        }
    }

    // ==========================================
    // نظام الصلاحيات
    // ==========================================
    getPermissionsForRole(roleName) {
        const roleObj = Object.values(ROLES).find(r => r.name === roleName);
        return roleObj ? roleObj.permissions : ['view_tasks'];
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const userPermissions = this.currentUser.permissions || [];
        
        // Super Admin لديه كل الصلاحيات
        if (userPermissions.includes('all')) return true;
        
        return userPermissions.includes(permission);
    }

    canManageUsers() {
        return this.hasPermission('manage_users') || this.hasPermission('all');
    }

    canManageTasks() {
        return this.hasPermission('manage_tasks') || this.hasPermission('create_tasks') || this.hasPermission('all');
    }

    canApprove() {
        return this.hasPermission('approve_initial') || this.hasPermission('approve_final') || this.hasPermission('all');
    }

    canPublish() {
        return this.hasPermission('publish') || this.hasPermission('all');
    }

    canViewReports() {
        return this.hasPermission('view_reports') || this.hasPermission('all');
    }

    getRoleLevel() {
        if (!this.currentUser) return 0;
        const roleObj = Object.values(ROLES).find(r => r.name === this.currentUser.role);
        return roleObj ? roleObj.level : 0;
    }

    getRoleLabel() {
        if (!this.currentUser) return 'زائر';
        const roleObj = Object.values(ROLES).find(r => r.name === this.currentUser.role);
        return roleObj ? roleObj.label : 'مستخدم';
    }

    // ==========================================
    // إدارة المستخدمين (للمسؤولين)
    // ==========================================
    async getAllUsers() {
        if (!this.canManageUsers()) {
            throw new Error('ليس لديك صلاحية لعرض المستخدمين');
        }
        
        const snapshot = await db.collection(COLLECTIONS.USERS).orderBy('createdAt', 'desc').get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    }

    async updateUserRole(userId, newRole) {
        if (!this.canManageUsers()) {
            throw new Error('ليس لديك صلاحية لتغيير الأدوار');
        }
        
        // لا يمكن تغيير دور نفسك
        if (userId === this.currentUser.uid) {
            throw new Error('لا يمكنك تغيير دورك الخاص');
        }
        
        const permissions = this.getPermissionsForRole(newRole);
        
        await db.collection(COLLECTIONS.USERS).doc(userId).update({
            role: newRole,
            permissions: permissions,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: this.currentUser.uid
        });
        
        await this.logActivity('role_changed', null, `تم تغيير دور المستخدم إلى: ${newRole}`);
        showToast('تم تحديث الدور بنجاح', 'success');
    }

    async toggleUserStatus(userId, isActive) {
        if (!this.canManageUsers()) {
            throw new Error('ليس لديك صلاحية');
        }
        
        if (userId === this.currentUser.uid) {
            throw new Error('لا يمكنك تعطيل حسابك');
        }
        
        await db.collection(COLLECTIONS.USERS).doc(userId).update({
            isActive: isActive,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: this.currentUser.uid
        });
        
        showToast(isActive ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', 'success');
    }

    // ==========================================
    // تسجيل النشاط
    // ==========================================
    async logActivity(action, taskId, details) {
        try {
            await db.collection(COLLECTIONS.ACTIVITY_LOG).add({
                action: action,
                taskId: taskId,
                details: details,
                userId: this.currentUser?.uid || 'anonymous',
                userName: this.currentUser?.name || 'زائر',
                userEmail: this.currentUser?.email || null,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('خطأ في تسجيل النشاط:', error);
        }
    }

    // ==========================================
    // تحديث واجهة المستخدم
    // ==========================================
    updateUI() {
        const adminToolbar = document.getElementById('admin-toolbar');
        const loginPrompt = document.getElementById('login-prompt');
        const userNameEl = document.getElementById('current-user-name');
        const userRoleEl = document.getElementById('user-role-label');
        const userPhotoEl = document.getElementById('user-photo');
        
        if (this.currentUser) {
            // المستخدم مسجل الدخول
            if (adminToolbar) adminToolbar.style.display = 'flex';
            if (loginPrompt) loginPrompt.style.display = 'none';
            
            if (userNameEl) userNameEl.textContent = this.currentUser.name || this.currentUser.displayName;
            if (userRoleEl) userRoleEl.textContent = this.getRoleLabel();
            
            if (userPhotoEl && this.currentUser.photoURL) {
                userPhotoEl.src = this.currentUser.photoURL;
                userPhotoEl.style.display = 'block';
            }
            
            // إظهار/إخفاء العناصر حسب الصلاحيات
            this.updatePermissionsUI();
            
        } else {
            // المستخدم غير مسجل الدخول
            if (adminToolbar) adminToolbar.style.display = 'none';
            if (loginPrompt) loginPrompt.style.display = 'block';
        }
    }

    updatePermissionsUI() {
        // إخفاء/إظهار أزرار حسب الصلاحيات
        document.querySelectorAll('[data-permission]').forEach(el => {
            const requiredPermission = el.dataset.permission;
            el.style.display = this.hasPermission(requiredPermission) ? '' : 'none';
        });
        
        // للأدوار المحددة
        document.querySelectorAll('[data-role]').forEach(el => {
            const requiredRole = el.dataset.role;
            const roleObj = Object.values(ROLES).find(r => r.name === requiredRole);
            const requiredLevel = roleObj ? roleObj.level : 0;
            el.style.display = this.getRoleLevel() >= requiredLevel ? '' : 'none';
        });
        
        // إظهار زر إدارة المستخدمين للمسؤولين فقط
        const manageUsersBtn = document.getElementById('manage-users-btn');
        if (manageUsersBtn) {
            manageUsersBtn.style.display = this.canManageUsers() ? 'flex' : 'none';
        }
    }
}

// إنشاء instance عام
const authManager = new AuthManager();

// دوال مساعدة للاستخدام من HTML
async function signInWithGoogle() {
    await authManager.signInWithGoogle();
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    await authManager.signInWithEmail(email, password);
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    await authManager.createAccount(name, email, password);
}

async function signOutUser() {
    await authManager.signOut();
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof auth !== 'undefined') {
            authManager.init().then(() => {
                console.log('✅ Auth Manager Initialized');
                // تهيئة نظام المهام بعد المصادقة
                if (typeof initTaskSystem === 'function') {
                    initTaskSystem();
                }
            });
        }
    }, 500);
});
