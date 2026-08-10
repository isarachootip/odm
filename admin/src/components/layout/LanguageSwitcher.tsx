"use client";

import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Since next-intl injects the locale into the pathname, e.g. /th/products
  const currentLocale = pathname.startsWith('/en') ? 'en' : 'th';

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    
    // Replace the locale in the URL
    // e.g. /th/products -> /en/products
    let newPath = pathname;
    if (pathname.startsWith(`/${currentLocale}`)) {
      newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    } else {
      newPath = `/${newLocale}${pathname}`;
    }
    
    // Ensure we don't end up with //
    if (newPath === `/${newLocale}/`) newPath = `/${newLocale}`;
    
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2 text-sm font-semibold bg-gray-100 px-3 py-1.5 rounded-full">
      <button 
        onClick={() => switchLocale('th')}
        className={`transition-colors ${currentLocale === 'th' ? "text-orange-600" : "text-gray-400 hover:text-gray-700"}`}
      >
        TH
      </button>
      <span className="text-gray-300">|</span>
      <button 
        onClick={() => switchLocale('en')}
        className={`transition-colors ${currentLocale === 'en' ? "text-orange-600" : "text-gray-400 hover:text-gray-700"}`}
      >
        EN
      </button>
    </div>
  );
}
