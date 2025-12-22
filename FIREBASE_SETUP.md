# إعداد Firebase لنظام إدارة مهام حملة ALIC

## 📋 المتطلبات

1. حساب Firebase (مجاني)
2. مشروع Firebase جديد
3. تفعيل Firestore Database
4. تفعيل Firebase Authentication

---

## 🚀 خطوات الإعداد

### الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على **Add Project**
3. أدخل اسم المشروع: `nobles-alic-campaign`
4. اتبع الخطوات لإنشاء المشروع

### الخطوة 2: تفعيل Authentication

1. من القائمة الجانبية، اختر **Build > Authentication**
2. انقر على **Get Started**
3. في تبويب **Sign-in method**، فعّل:
   - **Email/Password** - للتسجيل العادي
   - **Google** - لتسجيل الدخول السريع عبر Google

### الخطوة 2.1: إعداد تسجيل الدخول عبر Google

1. في قسم **Sign-in method**، انقر على **Google**
2. فعّل **Enable**
3. أدخل **Project support email** (بريدك الإلكتروني)
4. انقر **Save**
5. **مهم**: أضف نطاق موقعك في **Authorized domains**:
   - `localhost` (للتطوير)
   - `your-domain.com` (للإنتاج)

### الخطوة 3: إنشاء Firestore Database

1. من القائمة الجانبية، اختر **Build > Firestore Database**
2. انقر على **Create Database**
3. اختر **Start in test mode** (للتطوير)
4. اختر أقرب موقع جغرافي

### الخطوة 4: الحصول على إعدادات Firebase

1. اذهب إلى **Project Settings** (رمز الترس)
2. انتقل لقسم **Your apps**
3. انقر على أيقونة **Web** (</>)
4. سجّل التطبيق باسم: `ALIC Campaign Manager`
5. انسخ الـ **firebaseConfig**

### الخطوة 5: تحديث ملف الإعدادات

افتح الملف `static/js/firebase-config.js` واستبدل الإعدادات:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",           // استبدل بمفتاحك
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## 🔐 قواعد الأمان (Firestore Rules)

انسخ هذه القواعد إلى **Firestore > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // المستخدمون
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // المهام
    match /campaign_tasks/{taskId} {
      allow read: if true; // يمكن للجميع القراءة
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'editor'];
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'supervisor', 'editor'];
      allow delete: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // الموافقات
    match /approvals/{approvalId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'supervisor'];
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'supervisor'];
    }
    
    // الإشعارات
    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // سجل النشاط
    match /activity_log/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // الميزانية
    match /budget_tracking/{budgetId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    // مؤشرات الأداء
    match /kpi_metrics/{metricId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
  }
}
```

---

## 👥 إنشاء المستخدمين الأوائل

### عبر Firebase Console:

1. اذهب إلى **Authentication > Users**
2. انقر **Add User**
3. أنشئ المستخدمين التاليين:

| البريد الإلكتروني | كلمة المرور | الدور |
|------------------|-------------|-------|
| admin@nobles.jo | Admin@2025 | admin |
| manager@nobles.jo | Manager@2025 | manager |
| supervisor@nobles.jo | Super@2025 | supervisor |
| editor@nobles.jo | Editor@2025 | editor |

### إضافة أدوار المستخدمين في Firestore:

بعد إنشاء المستخدمين، أضف وثائق في collection `users`:

```json
// Document ID = User UID من Authentication
{
  "name": "مدير النظام",
  "email": "admin@nobles.jo",
  "role": "admin",
  "createdAt": "2025-12-22"
}
```

---

## 📊 تهيئة البيانات الأولية

افتح Console المتصفح وقم بتشغيل:

```javascript
// تأكد من تسجيل الدخول كـ admin أولاً
seedCampaignData();
```

هذا سيقوم بإنشاء:
- 20 مهمة للحملة
- مؤشرات الأداء الأولية
- إعدادات الميزانية

---

## 🎭 الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|----------|
| **admin** | كل الصلاحيات + إدارة المستخدمين |
| **manager** | موافقة نهائية + نشر + تعديل الميزانية |
| **supervisor** | مراجعة + موافقة أولية |
| **editor** | إنشاء وتعديل المهام + إرسال للمراجعة |
| **viewer** | عرض فقط |

---

## 🔄 سلسلة الموافقات

```
[Editor] إنشاء المحتوى
    ↓
[Supervisor] مراجعة المشرف
    ↓
[Manager] موافقة المدير
    ↓
[Admin] الموافقة النهائية (اختياري)
    ↓
[Manager/Admin] النشر
```

---

## 🔐 نظام تسجيل الدخول عبر Google

### المميزات:
- تسجيل دخول سريع بنقرة واحدة
- لا حاجة لتذكر كلمة مرور
- صورة الملف الشخصي من Google
- أمان إضافي من Google

### تعيين الأدوار تلقائياً:
- أضف الإيميلات الإدارية في المصفوفة `ADMIN_EMAILS` في الكود
- المستخدمون في القائمة يحصلون على دور `admin` تلقائياً
- باقي المستخدمين يحصلون على دور `viewer` افتراضياً

```javascript
const ADMIN_EMAILS = [
    'admin@nobles.sa',
    'your-email@example.com'
];
```

---

## 👥 إدارة المستخدمين

### للمديرين (Admin) فقط:
1. سجّل الدخول بحساب له صلاحية `admin`
2. انقر على زر **إدارة المستخدمين** في شريط الأدوات
3. يمكنك:
   - تغيير أدوار المستخدمين
   - تفعيل/تعطيل الحسابات
   - مراجعة معلومات المستخدمين

### هيكل الأدوار والمستويات:

| الدور | المستوى | الصلاحيات |
|-------|---------|----------|
| **admin** (مدير النظام) | 100 | كل شيء + إدارة المستخدمين |
| **manager** (مدير المشروع) | 80 | موافقة، نشر، إدارة الفريق |
| **lead** (رئيس فريق) | 60 | موافقة الفريق، تعيين المهام |
| **member** (عضو) | 40 | تعديل المهام المعينة، تعليق |
| **viewer** (مشاهد) | 10 | عرض فقط |

---

## 🧪 اختبار النظام

1. افتح الصفحة: `http://127.0.0.1:5000/report/alic-almuwaqqar?access=nobles2025`
2. انتقل إلى تاب **الخطة التنفيذية**
3. انقر على **تسجيل الدخول**
4. اختر **تسجيل الدخول عبر Google** أو أدخل بياناتك
5. جرّب التفاعل مع المهام

---

## 📱 الميزات المتاحة

✅ تسجيل الدخول عبر Google
✅ تسجيل الدخول بالبريد الإلكتروني
✅ نظام صلاحيات متعدد المستويات
✅ إدارة المستخدمين للأدمن
✅ عرض المهام حسب المراحل
✅ بدء العمل على مهمة
✅ إرسال للمراجعة
✅ سلسلة الموافقات
✅ النشر النهائي
✅ إشعارات في الوقت الفعلي
✅ سجل النشاط
✅ تتبع التقدم

---

## 🆘 استكشاف الأخطاء

### خطأ في الاتصال بـ Firebase
- تأكد من صحة الإعدادات في `firebase-config.js`
- تأكد من تفعيل الخدمات المطلوبة

### خطأ في تسجيل الدخول عبر Google
- تأكد من تفعيل Google في **Authentication > Sign-in method**
- تأكد من إضافة النطاق في **Authorized domains**
- تحقق من Console للأخطاء

### خطأ في الصلاحيات
- تأكد من إضافة دور المستخدم في collection `users`
- راجع قواعد Firestore

### المهام لا تظهر
- تأكد من تشغيل `seedCampaignData()` أولاً
- تحقق من Console لأي أخطاء

---

## 📞 الدعم

للمساعدة أو الاستفسارات، تواصل مع فريق التطوير.
