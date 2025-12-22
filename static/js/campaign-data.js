/**
 * ALIC Campaign Data Seeder
 * بيانات المهام الأولية للحملة
 */

const CAMPAIGN_TASKS = [
    // ==========================================
    // المرحلة الأولى: التهيئة والتشويق (1-14 يناير)
    // ==========================================
    {
        phase: 1,
        title: 'منشور LinkedIn تشويقي',
        description: 'إنشاء منشور تشويقي على LinkedIn يلمح للإعلان القادم عن ALIC',
        dueDate: '2026-01-01',
        assigneeName: 'فريق التسويق',
        type: 'social_media',
        priority: 'high',
        deliverables: ['نص المنشور', 'صورة/جرافيك', 'جدول النشر'],
        approvalFlow: ['editor', 'supervisor', 'manager']
    },
    {
        phase: 1,
        title: 'بيان صحفي الكشف عن ALIC',
        description: 'بيان صحفي رسمي يكشف عن مشروع ALIC ورؤيته',
        dueDate: '2025-12-26',
        assigneeName: 'فريق العلاقات العامة',
        type: 'press_release',
        priority: 'critical',
        deliverables: ['البيان الصحفي', 'ملف الوسائط', 'قائمة التوزيع'],
        approvalFlow: ['editor', 'supervisor', 'manager', 'admin']
    },
    {
        phase: 1,
        title: 'حملة SMS لغرفة الصناعة',
        description: 'رسائل SMS مستهدفة لأعضاء غرفة صناعة عمان',
        dueDate: '2025-12-27',
        assigneeName: 'فريق التسويق',
        type: 'sms_campaign',
        priority: 'high',
        deliverables: ['نص الرسالة', 'قائمة المستلمين', 'تقرير الإرسال'],
        approvalFlow: ['editor', 'manager']
    },
    {
        phase: 1,
        title: 'فيديو تشويقي (Teaser)',
        description: 'فيديو قصير تشويقي 30 ثانية عن المشروع',
        dueDate: '2026-01-05',
        assigneeName: 'فريق الإنتاج',
        type: 'video',
        priority: 'high',
        deliverables: ['الفيديو النهائي', 'ملف السيناريو', 'ملفات المصدر'],
        approvalFlow: ['editor', 'supervisor', 'manager', 'admin']
    },
    {
        phase: 1,
        title: 'مقال رأي اقتصادي',
        description: 'مقال رأي عن أهمية البنية التحتية اللوجستية في الأردن',
        dueDate: '2026-01-10',
        assigneeName: 'المتحدث الرسمي',
        type: 'article',
        priority: 'medium',
        deliverables: ['المقال', 'صورة الكاتب', 'السيرة الذاتية'],
        approvalFlow: ['editor', 'supervisor', 'manager']
    },

    // ==========================================
    // المرحلة الثانية: الإطلاق الاستراتيجي (15-20 يناير)
    // ==========================================
    {
        phase: 2,
        title: 'حدث تسليم محامص الشعب',
        description: 'تنظيم حدث تسليم المخزن الأول لشركة محامص الشعب',
        dueDate: '2026-01-15',
        assigneeName: 'فريق الفعاليات',
        type: 'event',
        priority: 'critical',
        deliverables: ['خطة الحدث', 'قائمة المدعوين', 'البرنامج', 'التغطية الإعلامية'],
        approvalFlow: ['editor', 'supervisor', 'manager', 'admin']
    },
    {
        phase: 2,
        title: 'فيديو محامص الشعب (قصة النجاح)',
        description: 'فيديو توثيقي 3 دقائق عن شراكة محامص الشعب مع ALIC',
        dueDate: '2026-01-15',
        assigneeName: 'فريق الإنتاج',
        type: 'video',
        priority: 'critical',
        deliverables: ['الفيديو النهائي', 'المقابلات', 'B-Roll'],
        approvalFlow: ['editor', 'supervisor', 'manager', 'admin']
    },
    {
        phase: 2,
        title: 'بيان صحفي الإطلاق الرسمي',
        description: 'بيان صحفي رسمي بمناسبة الإطلاق الرسمي للمشروع',
        dueDate: '2026-01-15',
        assigneeName: 'فريق العلاقات العامة',
        type: 'press_release',
        priority: 'critical',
        deliverables: ['البيان الصحفي', 'صور الحدث', 'تصريحات المسؤولين'],
        approvalFlow: ['editor', 'supervisor', 'manager', 'admin']
    },
    {
        phase: 2,
        title: 'مقابلة تلفزيونية (رؤيا/المملكة)',
        description: 'مقابلة تلفزيونية مع CEO على قناة رؤيا أو المملكة',
        dueDate: '2026-01-16',
        assigneeName: 'أحمد مرعي - CEO',
        type: 'interview',
        priority: 'high',
        deliverables: ['نقاط الحديث', 'Media Kit', 'تسجيل المقابلة'],
        approvalFlow: ['supervisor', 'manager', 'admin']
    },
    {
        phase: 2,
        title: 'جولة إعلامية في الموقع',
        description: 'تنظيم جولة للصحفيين في موقع ALIC',
        dueDate: '2026-01-17',
        assigneeName: 'فريق العلاقات العامة',
        type: 'media_tour',
        priority: 'high',
        deliverables: ['برنامج الجولة', 'قائمة الصحفيين', 'ملف إعلامي'],
        approvalFlow: ['editor', 'supervisor', 'manager']
    },
    {
        phase: 2,
        title: 'حملة LinkedIn الرئيسية',
        description: 'سلسلة منشورات LinkedIn للإعلان الرسمي',
        dueDate: '2026-01-15',
        assigneeName: 'فريق التسويق',
        type: 'social_media',
        priority: 'high',
        deliverables: ['5 منشورات', 'جرافيكس', 'جدول النشر'],
        approvalFlow: ['editor', 'supervisor', 'manager']
    },
    {
        phase: 2,
        title: 'بودكاست اقتصادي',
        description: 'حلقة بودكاست مع CEO عن رؤية ALIC',
        dueDate: '2026-01-18',
        assigneeName: 'أحمد مرعي - CEO',
        type: 'podcast',
        priority: 'medium',
        deliverables: ['تسجيل البودكاست', 'نقاط الحديث'],
        approvalFlow: ['supervisor', 'manager']
    },
    {
        phase: 2,
        title: 'منشورات Twitter/X',
        description: 'سلسلة تغريدات للإعلان وتغطية الحدث',
        dueDate: '2026-01-15',
        assigneeName: 'فريق التسويق',
        type: 'social_media',
        priority: 'medium',
        deliverables: ['10 تغريدات', 'صور/فيديوهات قصيرة'],
        approvalFlow: ['editor', 'supervisor']
    },
    {
        phase: 2,
        title: 'Email Newsletter',
        description: 'نشرة إخبارية للعملاء المحتملين والشركاء',
        dueDate: '2026-01-16',
        assigneeName: 'فريق التسويق',
        type: 'email',
        priority: 'medium',
        deliverables: ['تصميم النشرة', 'قائمة المستلمين', 'تقرير الفتح'],
        approvalFlow: ['editor', 'manager']
    },
    {
        phase: 2,
        title: 'تغطية صحفية محلية',
        description: 'تنسيق التغطية مع الصحف المحلية',
        dueDate: '2026-01-17',
        assigneeName: 'فريق العلاقات العامة',
        type: 'press',
        priority: 'high',
        deliverables: ['قصاصات صحفية', 'تقرير التغطية'],
        approvalFlow: ['editor', 'supervisor', 'manager']
    },

    // ==========================================
    // المرحلة الثالثة: ترسيخ الريادة (21-31 يناير)
    // ==========================================
    {
        phase: 3,
        title: 'ملف Case Study محامص الشعب',
        description: 'دراسة حالة مفصلة عن شراكة محامص الشعب',
        dueDate: '2026-01-22',
        assigneeName: 'فريق المحتوى',
        type: 'document',
        priority: 'high',
        deliverables: ['PDF التقرير', 'نسخة ويب', 'ملخص تنفيذي'],
        approvalFlow: ['editor', 'supervisor', 'manager']
    },
    {
        phase: 3,
        title: 'Infographic الإنجازات',
        description: 'إنفوجرافيك يلخص إنجازات ALIC والأرقام الرئيسية',
        dueDate: '2026-01-25',
        assigneeName: 'فريق التصميم',
        type: 'design',
        priority: 'medium',
        deliverables: ['الإنفوجرافيك', 'نسخ متعددة الأحجام'],
        approvalFlow: ['editor', 'supervisor']
    },
    {
        phase: 3,
        title: 'تقرير أثر اقتصادي',
        description: 'تقرير عن الأثر الاقتصادي المتوقع للمشروع',
        dueDate: '2026-01-28',
        assigneeName: 'فريق الأبحاث',
        type: 'report',
        priority: 'high',
        deliverables: ['التقرير الكامل', 'ملخص تنفيذي', 'بيانات داعمة'],
        approvalFlow: ['editor', 'supervisor', 'manager', 'admin']
    },
    {
        phase: 3,
        title: 'حملة LinkedIn B2B',
        description: 'حملة مستهدفة للشركات والمستثمرين على LinkedIn',
        dueDate: '2026-01-21',
        assigneeName: 'فريق التسويق',
        type: 'advertising',
        priority: 'high',
        deliverables: ['الإعلانات', 'استهداف الجمهور', 'تقرير الأداء'],
        approvalFlow: ['editor', 'manager']
    },
    {
        phase: 3,
        title: 'تقرير ختام الحملة',
        description: 'تقرير شامل يلخص نتائج الحملة ومؤشرات الأداء',
        dueDate: '2026-01-31',
        assigneeName: 'مدير المشروع',
        type: 'report',
        priority: 'critical',
        deliverables: ['التقرير النهائي', 'تحليل KPIs', 'توصيات مستقبلية'],
        approvalFlow: ['supervisor', 'manager', 'admin']
    }
];

/**
 * تهيئة البيانات في Firebase
 */
async function seedCampaignTasks() {
    const batch = db.batch();
    
    CAMPAIGN_TASKS.forEach((task, index) => {
        const taskRef = db.collection(COLLECTIONS.TASKS).doc();
        batch.set(taskRef, {
            ...task,
            status: TASK_STATUS.NOT_STARTED,
            progress: 0,
            order: index,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });

    await batch.commit();
    console.log('✅ تم إنشاء جميع المهام بنجاح');
}

/**
 * إنشاء المستخدمين الافتراضيين
 */
async function seedDefaultUsers() {
    const defaultUsers = [
        { email: 'admin@nobles.jo', name: 'مدير النظام', role: ROLES.ADMIN },
        { email: 'manager@nobles.jo', name: 'مدير المشروع', role: ROLES.MANAGER },
        { email: 'supervisor@nobles.jo', name: 'مشرف المحتوى', role: ROLES.SUPERVISOR },
        { email: 'editor@nobles.jo', name: 'محرر المحتوى', role: ROLES.EDITOR }
    ];

    for (const user of defaultUsers) {
        await db.collection(COLLECTIONS.USERS).add({
            ...user,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    console.log('✅ تم إنشاء المستخدمين الافتراضيين');
}

/**
 * تهيئة مؤشرات الأداء
 */
async function seedKPIs() {
    await db.collection(COLLECTIONS.KPI).doc('campaign_progress').set({
        totalTasks: 20,
        completedTasks: 0,
        inProgressTasks: 0,
        progressPercentage: 0,
        targetReach: 500000,
        currentReach: 0,
        targetEngagement: 3,
        currentEngagement: 0,
        targetLeads: 200,
        currentLeads: 0,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ تم تهيئة مؤشرات الأداء');
}

/**
 * تهيئة الميزانية
 */
async function seedBudget() {
    await db.collection(COLLECTIONS.BUDGET).doc('main').set({
        totalBudget: 10000,
        spent: 0,
        remaining: 10000,
        categories: {
            production: { allocated: 4000, spent: 0 },
            advertising: { allocated: 3000, spent: 0 },
            events: { allocated: 2000, spent: 0 },
            other: { allocated: 1000, spent: 0 }
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ تم تهيئة الميزانية');
}

// تصدير الدوال
window.seedCampaignData = async function() {
    try {
        await seedCampaignTasks();
        await seedDefaultUsers();
        await seedKPIs();
        await seedBudget();
        alert('✅ تم تهيئة جميع البيانات بنجاح!');
    } catch (error) {
        console.error('❌ خطأ في تهيئة البيانات:', error);
        alert('❌ حدث خطأ في تهيئة البيانات');
    }
};
