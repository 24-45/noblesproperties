"""
إعدادات التطبيق
Application Configuration
"""

import os
from pathlib import Path

# المسار الأساسي للمشروع
BASE_DIR = Path(__file__).resolve().parent


class Config:
    """الإعدادات الأساسية"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'nobles-properties-secret-key-2024'
    
    # مسارات الملفات
    DATA_DIR = BASE_DIR / 'data'
    STATIC_DIR = BASE_DIR / 'static'
    TEMPLATES_DIR = BASE_DIR / 'templates'
    
    # إعدادات JSON
    JSON_AS_ASCII = False
    JSON_SORT_KEYS = False
    
    # معلومات الشركة
    COMPANY_NAME = 'نوبلز العقارية'
    COMPANY_NAME_EN = 'Nobles Properties'
    COMPANY_WEBSITE = 'https://noblesproperties.com'
    COMPANY_EMAIL = 'info@noblesproperties.com'
    COMPANY_PHONE_JO = '+962 (06) 5546161'
    COMPANY_PHONE_UAE = '+971 (4) 344 1801'
    COMPANY_ADDRESS_JO = 'أبراج الحجاز، مكتب 406، شارع مكة، عمان، الأردن'
    COMPANY_ADDRESS_UAE = 'الممزر، دبي، الإمارات العربية المتحدة'
    
    # ألوان العلامة التجارية
    PRIMARY_COLOR = '#dc1f27'  # الأحمر
    SECONDARY_COLOR = '#ffffff'  # الأبيض
    ACCENT_COLOR = '#00502F'  # الأخضر (اختياري)
    
    # إعدادات اللغة
    DEFAULT_LANGUAGE = 'ar'
    SUPPORTED_LANGUAGES = ['ar', 'en']


class DevelopmentConfig(Config):
    """إعدادات التطوير"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """إعدادات الإنتاج"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """إعدادات الاختبار"""
    DEBUG = True
    TESTING = True


# اختيار الإعدادات حسب البيئة
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
