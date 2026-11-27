import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
}

export default function SeoHead({ title, description }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    const updateMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[name="title"]', title);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="twitter:title"]', title);
    updateMeta('meta[property="twitter:description"]', description);
  }, [title, description]);

  return null;
}
