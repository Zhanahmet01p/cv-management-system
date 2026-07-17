import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          common: {
            search: 'Search...',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
          },
          nav: {
            positions: 'Positions',
            profile: 'Profile',
            admin: 'Admin',
            logout: 'Logout',
            login: 'Login',
          },
          home: {
            stats: 'Statistics',
            latestPositions: 'Latest Positions',
            popularPositions: 'Most Popular',
          }
        }
      },
      ru: {
        translation: {
          common: {
            search: 'Поиск...',
            save: 'Сохранить',
            cancel: 'Отмена',
            delete: 'Удалить',
            edit: 'Изменить',
          },
          nav: {
            positions: 'Вакансии',
            profile: 'Профиль',
            admin: 'Админ',
            logout: 'Выйти',
            login: 'Войти',
          },
          home: {
            stats: 'Статистика',
            latestPositions: 'Последние вакансии',
            popularPositions: 'Популярные',
          }
        }
      }
    }
  });

export default i18n;
