/**
 * ALIC Campaign Task Manager
 * نظام إدارة مهام حملة ALIC الإعلامية
 */

class ALICTaskManager {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.listeners = [];
        this.init();
    }

    // ==========================================
    // التهيئة
    // ==========================================
    async init() {
        // Listen for auth state changes
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = await this.getUserData(user.uid);
                this.setupRealtimeListeners();
                this.updateUI();
            } else {
                this.showLoginPrompt();
            }
        });
    }

    // ==========================================
    // إدارة المستخدمين
    // ==========================================
    async getUserData(uid) {
        const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
        if (doc.exists) {
            return { uid, ...doc.data() };
        }
        return null;
    }

    async createUser(uid, userData) {
        await db.collection(COLLECTIONS.USERS).doc(uid).set({
            ...userData,
            role: ROLES.VIEWER,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // ==========================================
    // المهام - CRUD Operations
    // ==========================================
    
    // إنشاء مهمة جديدة
    async createTask(taskData) {
        const task = {
            ...taskData,
            status: TASK_STATUS.NOT_STARTED,
            progress: 0,
            createdBy: this.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvals: [],
            comments: [],
            attachments: [],
            subtasks: []
        };

        const docRef = await db.collection(COLLECTIONS.TASKS).add(task);
        await this.logActivity('task_created', docRef.id, task.title);
        return docRef.id;
    }

    // تحديث حالة المهمة
    async updateTaskStatus(taskId, newStatus, notes = '') {
        const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
        
        await taskRef.update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdatedBy: this.currentUser.uid
        });

        await this.logActivity('status_changed', taskId, `تم تغيير الحالة إلى: ${this.getStatusLabel(newStatus)}`);

        // إذا تم الانتهاء، انتقل لمرحلة المراجعة
        if (newStatus === TASK_STATUS.IN_PROGRESS) {
            this.showToast('تم بدء العمل على المهمة', 'info');
        }
    }

    // بدء العمل على مهمة
    async startTask(taskId) {
        await this.updateTaskStatus(taskId, TASK_STATUS.IN_PROGRESS);
        await this.updateTaskProgress(taskId, 10);
    }

    // إرسال للمراجعة
    async submitForReview(taskId, deliverables = []) {
        const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
        
        await taskRef.update({
            status: TASK_STATUS.PENDING_REVIEW,
            deliverables: deliverables,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            submittedBy: this.currentUser.uid,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await this.logActivity('submitted_review', taskId, 'تم إرسال المهمة للمراجعة');
        await this.notifyApprovers(taskId, APPROVAL_LEVELS.LEVEL_2);
        this.showToast('تم إرسال المهمة للمراجعة', 'success');
    }

    // تحديث نسبة الإنجاز
    async updateTaskProgress(taskId, progress) {
        await db.collection(COLLECTIONS.TASKS).doc(taskId).update({
            progress: progress,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // ==========================================
    // نظام الموافقات
    // ==========================================

    // طلب موافقة
    async requestApproval(taskId, level) {
        const approval = {
            taskId: taskId,
            level: level,
            requestedBy: this.currentUser.uid,
            requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            approvers: []
        };

        const docRef = await db.collection(COLLECTIONS.APPROVALS).add(approval);
        
        // تحديث المهمة
        await db.collection(COLLECTIONS.TASKS).doc(taskId).update({
            status: TASK_STATUS.PENDING_APPROVAL,
            currentApprovalId: docRef.id,
            currentApprovalLevel: level
        });

        await this.notifyApprovers(taskId, level);
        return docRef.id;
    }

    // موافقة على مهمة
    async approveTask(taskId, approvalId, comments = '') {
        const approvalRef = db.collection(COLLECTIONS.APPROVALS).doc(approvalId);
        const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);

        // تسجيل الموافقة
        await approvalRef.update({
            status: 'approved',
            approvedBy: this.currentUser.uid,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            comments: comments
        });

        // التحقق من المستوى الحالي
        const taskDoc = await taskRef.get();
        const task = taskDoc.data();
        const currentLevel = task.currentApprovalLevel;

        // تحديد المستوى التالي
        const levels = Object.keys(APPROVAL_LEVELS);
        const currentIndex = levels.indexOf(currentLevel);
        
        if (currentIndex < levels.length - 1) {
            // انتقال للمستوى التالي
            const nextLevel = levels[currentIndex + 1];
            await this.requestApproval(taskId, nextLevel);
            await this.logActivity('approved', taskId, `تمت الموافقة - ${APPROVAL_LEVELS[currentLevel].title}`);
        } else {
            // موافقة نهائية - جاهز للنشر
            await taskRef.update({
                status: TASK_STATUS.APPROVED,
                finalApprovedAt: firebase.firestore.FieldValue.serverTimestamp(),
                finalApprovedBy: this.currentUser.uid
            });
            await this.logActivity('final_approved', taskId, 'تمت الموافقة النهائية - جاهز للنشر');
            this.showToast('✅ تمت الموافقة النهائية - المهمة جاهزة للنشر', 'success');
        }
    }

    // رفض مهمة
    async rejectTask(taskId, approvalId, reason) {
        await db.collection(COLLECTIONS.APPROVALS).doc(approvalId).update({
            status: 'rejected',
            rejectedBy: this.currentUser.uid,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
            rejectionReason: reason
        });

        await db.collection(COLLECTIONS.TASKS).doc(taskId).update({
            status: TASK_STATUS.REJECTED,
            rejectionReason: reason,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await this.logActivity('rejected', taskId, `تم الرفض: ${reason}`);
        this.showToast('تم رفض المهمة وإعادتها للتعديل', 'warning');
    }

    // نشر المهمة
    async publishTask(taskId) {
        const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
        const taskDoc = await taskRef.get();
        const task = taskDoc.data();

        if (task.status !== TASK_STATUS.APPROVED) {
            this.showToast('لا يمكن النشر - المهمة غير معتمدة', 'error');
            return;
        }

        await taskRef.update({
            status: TASK_STATUS.PUBLISHED,
            publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
            publishedBy: this.currentUser.uid,
            progress: 100
        });

        await this.logActivity('published', taskId, 'تم نشر المهمة بنجاح');
        await this.updateCampaignProgress();
        this.showToast('🎉 تم نشر المهمة بنجاح!', 'success');
    }

    // ==========================================
    // إشعارات
    // ==========================================
    async notifyApprovers(taskId, level) {
        const role = APPROVAL_LEVELS[level].role;
        
        // جلب المستخدمين بالدور المطلوب
        const usersSnapshot = await db.collection(COLLECTIONS.USERS)
            .where('role', '==', role)
            .get();

        usersSnapshot.forEach(async (doc) => {
            // إرسال إشعار لكل مستخدم
            await db.collection('notifications').add({
                userId: doc.id,
                taskId: taskId,
                type: 'approval_request',
                message: `مطلوب موافقتك على مهمة جديدة - ${APPROVAL_LEVELS[level].title}`,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    }

    // ==========================================
    // سجل النشاط
    // ==========================================
    async logActivity(action, taskId, details) {
        await db.collection(COLLECTIONS.ACTIVITY_LOG).add({
            action: action,
            taskId: taskId,
            details: details,
            userId: this.currentUser?.uid || 'system',
            userName: this.currentUser?.name || 'النظام',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // ==========================================
    // تتبع التقدم
    // ==========================================
    async updateCampaignProgress() {
        const snapshot = await db.collection(COLLECTIONS.TASKS).get();
        let total = 0;
        let completed = 0;
        let inProgress = 0;

        snapshot.forEach((doc) => {
            total++;
            const status = doc.data().status;
            if (status === TASK_STATUS.PUBLISHED) completed++;
            if (status === TASK_STATUS.IN_PROGRESS) inProgress++;
        });

        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // تحديث مؤشرات الأداء
        await db.collection(COLLECTIONS.KPI).doc('campaign_progress').set({
            totalTasks: total,
            completedTasks: completed,
            inProgressTasks: inProgress,
            progressPercentage: progress,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // تحديث واجهة المستخدم
        this.updateProgressUI(progress, completed, inProgress, total);
    }

    // ==========================================
    // Real-time Listeners
    // ==========================================
    setupRealtimeListeners() {
        // الاستماع لتحديثات المهام
        const tasksListener = db.collection(COLLECTIONS.TASKS)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                this.tasks = [];
                snapshot.forEach((doc) => {
                    this.tasks.push({ id: doc.id, ...doc.data() });
                });
                this.renderTasks();
                this.updateCampaignProgress();
            });

        this.listeners.push(tasksListener);

        // الاستماع للإشعارات
        if (this.currentUser) {
            const notificationsListener = db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .onSnapshot((snapshot) => {
                    this.updateNotificationBadge(snapshot.size);
                });

            this.listeners.push(notificationsListener);
        }
    }

    // ==========================================
    // UI Updates
    // ==========================================
    renderTasks() {
        // المرحلة الأولى
        this.renderPhaseTasksUI('phase1', this.tasks.filter(t => t.phase === 1));
        // المرحلة الثانية
        this.renderPhaseTasksUI('phase2', this.tasks.filter(t => t.phase === 2));
        // المرحلة الثالثة
        this.renderPhaseTasksUI('phase3', this.tasks.filter(t => t.phase === 3));
    }

    renderPhaseTasksUI(phaseId, tasks) {
        const container = document.getElementById(`${phaseId}-tasks`);
        if (!container) return;

        container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const statusClass = this.getStatusClass(task.status);
        const statusLabel = this.getStatusLabel(task.status);
        const canEdit = this.canUserEdit(task);
        const canApprove = this.canUserApprove(task);

        return `
            <div class="task-item" data-task-id="${task.id}" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                background: rgba(0,0,0,0.2);
                border-radius: 12px;
                margin-bottom: 10px;
                border-right: 4px solid ${this.getStatusColor(task.status)};
                transition: all 0.3s ease;
            ">
                <div class="task-checkbox" style="flex-shrink: 0;">
                    ${task.status === TASK_STATUS.PUBLISHED 
                        ? '<i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>'
                        : task.status === TASK_STATUS.IN_PROGRESS
                            ? '<i class="fas fa-spinner fa-spin" style="color: #f59e0b; font-size: 1.5rem;"></i>'
                            : '<i class="far fa-circle" style="color: #64748b; font-size: 1.5rem;"></i>'
                    }
                </div>
                <div class="task-content" style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span style="color: #e2e8f0; font-size: 0.95rem; font-weight: 600;">${task.title}</span>
                        <span class="status-badge" style="
                            background: ${this.getStatusBgColor(task.status)};
                            color: ${this.getStatusColor(task.status)};
                            padding: 3px 10px;
                            border-radius: 12px;
                            font-size: 0.7rem;
                            font-weight: 600;
                        ">${statusLabel}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #64748b; font-size: 0.75rem;">
                            <i class="far fa-calendar-alt" style="margin-left: 5px;"></i>${task.dueDate || 'غير محدد'}
                        </span>
                        <span style="color: #64748b; font-size: 0.75rem;">
                            <i class="far fa-user" style="margin-left: 5px;"></i>${task.assigneeName || 'غير معين'}
                        </span>
                        ${task.progress > 0 ? `
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                                    <div style="width: ${task.progress}%; height: 100%; background: ${this.getStatusColor(task.status)};"></div>
                                </div>
                                <span style="color: #94a3b8; font-size: 0.7rem;">${task.progress}%</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions" style="display: flex; gap: 8px;">
                    ${canEdit ? `
                        <button onclick="taskManager.showTaskModal('${task.id}')" style="
                            background: rgba(59, 130, 246, 0.2);
                            border: none;
                            color: #60a5fa;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    ${canApprove ? `
                        <button onclick="taskManager.showApprovalModal('${task.id}')" style="
                            background: rgba(16, 185, 129, 0.2);
                            border: none;
                            color: #34d399;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " title="موافقة">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateProgressUI(progress, completed, inProgress, total) {
        // تحديث الدائرة
        const progressCircle = document.getElementById('progress-circle');
        if (progressCircle) {
            progressCircle.style.background = `conic-gradient(#10b981 0%, #10b981 ${progress}%, rgba(16, 185, 129, 0.2) ${progress}%)`;
            progressCircle.querySelector('.progress-value').textContent = `${progress}%`;
        }

        // تحديث الأرقام
        document.getElementById('completed-count')?.textContent = completed;
        document.getElementById('in-progress-count')?.textContent = inProgress;
        document.getElementById('total-tasks')?.textContent = `${completed} من ${total} منتج`;
    }

    // ==========================================
    // Helper Methods
    // ==========================================
    getStatusLabel(status) {
        const labels = {
            [TASK_STATUS.NOT_STARTED]: 'لم يبدأ',
            [TASK_STATUS.IN_PROGRESS]: 'قيد التنفيذ',
            [TASK_STATUS.PENDING_REVIEW]: 'بانتظار المراجعة',
            [TASK_STATUS.PENDING_APPROVAL]: 'بانتظار الموافقة',
            [TASK_STATUS.APPROVED]: 'معتمد',
            [TASK_STATUS.PUBLISHED]: 'تم النشر',
            [TASK_STATUS.REJECTED]: 'مرفوض'
        };
        return labels[status] || status;
    }

    getStatusColor(status) {
        const colors = {
            [TASK_STATUS.NOT_STARTED]: '#64748b',
            [TASK_STATUS.IN_PROGRESS]: '#f59e0b',
            [TASK_STATUS.PENDING_REVIEW]: '#8b5cf6',
            [TASK_STATUS.PENDING_APPROVAL]: '#3b82f6',
            [TASK_STATUS.APPROVED]: '#10b981',
            [TASK_STATUS.PUBLISHED]: '#10b981',
            [TASK_STATUS.REJECTED]: '#ef4444'
        };
        return colors[status] || '#64748b';
    }

    getStatusBgColor(status) {
        const colors = {
            [TASK_STATUS.NOT_STARTED]: 'rgba(100, 116, 139, 0.2)',
            [TASK_STATUS.IN_PROGRESS]: 'rgba(245, 158, 11, 0.2)',
            [TASK_STATUS.PENDING_REVIEW]: 'rgba(139, 92, 246, 0.2)',
            [TASK_STATUS.PENDING_APPROVAL]: 'rgba(59, 130, 246, 0.2)',
            [TASK_STATUS.APPROVED]: 'rgba(16, 185, 129, 0.2)',
            [TASK_STATUS.PUBLISHED]: 'rgba(16, 185, 129, 0.2)',
            [TASK_STATUS.REJECTED]: 'rgba(239, 68, 68, 0.2)'
        };
        return colors[status] || 'rgba(100, 116, 139, 0.2)';
    }

    getStatusClass(status) {
        return status.replace('_', '-');
    }

    canUserEdit(task) {
        if (!this.currentUser) return false;
        const editableRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR];
        return editableRoles.includes(this.currentUser.role) || 
               task.assigneeId === this.currentUser.uid;
    }

    canUserApprove(task) {
        if (!this.currentUser) return false;
        if (task.status !== TASK_STATUS.PENDING_APPROVAL) return false;
        
        const level = task.currentApprovalLevel;
        const requiredRole = APPROVAL_LEVELS[level]?.role;
        return this.currentUser.role === requiredRole || 
               this.currentUser.role === ROLES.ADMIN;
    }

    // ==========================================
    // Modals
    // ==========================================
    showTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const modal = document.getElementById('task-modal');
        // Populate modal with task data
        document.getElementById('modal-task-title').textContent = task.title;
        document.getElementById('modal-task-status').textContent = this.getStatusLabel(task.status);
        // ... more modal population
        
        modal.style.display = 'flex';
    }

    showApprovalModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const modal = document.getElementById('approval-modal');
        document.getElementById('approval-task-title').textContent = task.title;
        document.getElementById('approval-task-id').value = taskId;
        
        modal.style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // ==========================================
    // Toast Notifications
    // ==========================================
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getToastBg(type)};
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getToastBg(type) {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        return colors[type] || colors.info;
    }

    showLoginPrompt() {
        // عرض نافذة تسجيل الدخول
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }

    updateNotificationBadge(count) {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateUI() {
        // تحديث اسم المستخدم
        const userNameEl = document.getElementById('current-user-name');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.name;
        }

        // تحديث الصلاحيات في الواجهة
        this.updatePermissionsUI();
    }

    updatePermissionsUI() {
        if (!this.currentUser) return;

        // إخفاء/إظهار أزرار حسب الصلاحيات
        const adminElements = document.querySelectorAll('[data-role="admin"]');
        const managerElements = document.querySelectorAll('[data-role="manager"]');
        const editorElements = document.querySelectorAll('[data-role="editor"]');

        adminElements.forEach(el => {
            el.style.display = this.currentUser.role === ROLES.ADMIN ? 'block' : 'none';
        });

        managerElements.forEach(el => {
            el.style.display = [ROLES.ADMIN, ROLES.MANAGER].includes(this.currentUser.role) ? 'block' : 'none';
        });

        editorElements.forEach(el => {
            el.style.display = [ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR].includes(this.currentUser.role) ? 'block' : 'none';
        });
    }

    // ==========================================
    // Cleanup
    // ==========================================
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }
}

// Initialize Task Manager
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new ALICTaskManager();
});

// CSS Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    .task-item:hover {
        background: rgba(0,0,0,0.3) !important;
        transform: translateX(-5px);
    }
    
    .task-actions button:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);
