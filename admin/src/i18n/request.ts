import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['th', 'en', 'zh'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale)) {
    locale = 'th';
  }

  try {
    const msgs = (await import(`../../messages/${locale}.json`)).default;
    return { locale, messages: msgs };
  } catch (err) {
    console.error('Failed to load messages for locale:', locale, err);
    notFound();
  }
});
