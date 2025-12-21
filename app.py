"""
Nobles Properties - Interactive Report Website
نوبلز العقارية - موقع التقارير التفاعلي
"""

from flask import Flask, render_template, jsonify, send_from_directory, request
from pathlib import Path
import json

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # دعم اللغة العربية في JSON
app.config['TEMPLATES_AUTO_RELOAD'] = True  # تحميل القوالب مباشرة بعد تعديلها
app.jinja_env.auto_reload = True

# مسار ملفات البيانات
DATA_PATH = Path(app.root_path) / 'data'


def load_projects():
    """تحميل بيانات المشاريع من ملف JSON"""
    projects_file = DATA_PATH / 'projects.json'
    if projects_file.exists():
        with open(projects_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"projects": []}


def get_project_by_id(project_id):
    """جلب مشروع محدد بواسطة المعرف"""
    data = load_projects()
    for project in data.get('projects', []):
        if project.get('id') == project_id:
            return project
    return None


def get_project_by_slug(slug):
    """جلب مشروع محدد بواسطة الـ slug"""
    data = load_projects()
    for project in data.get('projects', []):
        if project.get('slug') == slug:
            return project
    return None


# ==================== ملفات ثابتة إضافية ====================

@app.route('/favicon.ico')
def favicon():
    """تقديم الأيقونة الافتراضية للمتصفحات"""
    static_path = Path(app.root_path) / 'static'
    return send_from_directory(static_path, 'images/favicon.svg', mimetype='image/svg+xml')


# ==================== الصفحات الرئيسية ====================

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    data = load_projects()
    return render_template('index.html', projects=data.get('projects', []))


@app.route('/login')
def login():
    """صفحة تسجيل الدخول"""
    return render_template('login.html')


@app.route('/projects')
def projects():
    """صفحة جميع المشاريع"""
    data = load_projects()
    return render_template('projects.html', projects=data.get('projects', []))


@app.route('/project/<slug>')
def project_detail(slug):
    """صفحة تفاصيل المشروع"""
    project = get_project_by_slug(slug)
    if not project:
        return render_template('404.html'), 404
    return render_template('project_detail.html', project=project)


@app.route('/benchmarking')
def benchmarking():
    """صفحة المقارنات المرجعية"""
    return render_template('benchmarking.html')


@app.route('/reports')
def reports():
    """صفحة التقارير"""
    data = load_projects()
    return render_template('reports.html', projects=data.get('projects', []))


@app.route('/report/<slug>')
def project_report(slug):
    """صفحة تقرير المشروع"""
    project = get_project_by_slug(slug)
    if not project:
        return render_template('404.html'), 404
    return render_template('project_report.html', project=project)


@app.route('/about')
def about():
    """صفحة من نحن"""
    return render_template('about.html')


# ==================== صفحة الاستبانة ====================

@app.route('/questionnaire/<slug>')
def questionnaire(slug):
    """صفحة الاستبانة المستقلة للعميل"""
    project = get_project_by_slug(slug)
    if not project:
        return render_template('404.html'), 404
    return render_template('questionnaire.html', 
                         project_name=project.get('name', 'المشروع'),
                         project_slug=slug)


# ==================== API Endpoints ====================

@app.route('/api/projects')
def api_projects():
    """API: جلب جميع المشاريع"""
    data = load_projects()
    return jsonify(data)


@app.route('/api/project/<slug>')
def api_project(slug):
    """API: جلب مشروع محدد"""
    project = get_project_by_slug(slug)
    if not project:
        return jsonify({"error": "المشروع غير موجود"}), 404
    return jsonify(project)


@app.route('/api/project/<slug>/stats')
def api_project_stats(slug):
    """API: إحصائيات المشروع"""
    project = get_project_by_slug(slug)
    if not project:
        return jsonify({"error": "المشروع غير موجود"}), 404
    
    stats = {
        "completion_percentage": project.get('completion_percentage', 0),
        "total_units": project.get('total_units', 0),
        "sold_units": project.get('sold_units', 0),
        "available_units": project.get('total_units', 0) - project.get('sold_units', 0),
        "monthly_progress": project.get('monthly_progress', []),
        "financial_data": project.get('financial_data', {})
    }
    return jsonify(stats)


@app.route('/api/project/<slug>/progress')
def api_project_progress(slug):
    """API: تقدم المشروع الشهري"""
    project = get_project_by_slug(slug)
    if not project:
        return jsonify({"error": "المشروع غير موجود"}), 404
    
    return jsonify({
        "project_name": project.get('name', ''),
        "monthly_progress": project.get('monthly_progress', [])
    })


@app.route('/api/questionnaire/submit', methods=['POST'])
def api_questionnaire_submit():
    """API: استلام إجابات الاستبانة"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "لا توجد بيانات"}), 400
    
    project_slug = data.get('project', '')
    answers = data.get('answers', {})
    
    # حفظ الإجابات في ملف JSON
    responses_file = DATA_PATH / 'questionnaire_responses.json'
    
    # قراءة الملف الحالي أو إنشاء جديد
    if responses_file.exists():
        with open(responses_file, 'r', encoding='utf-8') as f:
            responses = json.load(f)
    else:
        responses = {"responses": {}}
    
    # تحديث الاستجابة للمشروع (استبدال القديمة)
    from datetime import datetime
    responses["responses"][project_slug] = {
        "timestamp": datetime.now().isoformat(),
        "answers": answers
    }
    
    # حفظ الملف
    with open(responses_file, 'w', encoding='utf-8') as f:
        json.dump(responses, f, ensure_ascii=False, indent=2)
    
    return jsonify({"success": True, "message": "تم حفظ الاستبانة بنجاح"})


@app.route('/api/questionnaire/<slug>')
def api_questionnaire_get(slug):
    """API: جلب إجابات الاستبانة المحفوظة"""
    responses_file = DATA_PATH / 'questionnaire_responses.json'
    
    if responses_file.exists():
        with open(responses_file, 'r', encoding='utf-8') as f:
            responses = json.load(f)
        
        if slug in responses.get("responses", {}):
            return jsonify(responses["responses"][slug])
    
    return jsonify({"answers": {}})


# ==================== صفحات PDF ====================

@app.route('/pdf/project/<slug>')
def pdf_project(slug):
    """صفحة PDF للمشروع"""
    project = get_project_by_slug(slug)
    if not project:
        return render_template('404.html'), 404
    return render_template('pdf/project_report.html', project=project)


@app.route('/pdf/all-projects')
def pdf_all_projects():
    """صفحة PDF لجميع المشاريع"""
    data = load_projects()
    return render_template('pdf/all_projects.html', projects=data.get('projects', []))


# ==================== معالجة الأخطاء ====================

@app.errorhandler(404)
def page_not_found(e):
    """صفحة 404"""
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(e):
    """صفحة 500"""
    return render_template('500.html'), 500


# ==================== تشغيل التطبيق ====================

if __name__ == '__main__':
    app.run(
        debug=False,
        port=5000,
        host='127.0.0.1',
        threaded=True,
        use_reloader=False
    )
