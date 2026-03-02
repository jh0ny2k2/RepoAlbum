import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  twitterHandle?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({ 
  title = "My Memories App", 
  description = "The ultimate platform to preserve, organize, and share your life's most precious moments securely. Create collaborative albums and keep your memories alive forever.", 
  keywords = "memories, photo album, secure photo storage, private gallery, collaborative albums, digital memory box, share photos",
  image = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200", // Default high-quality cover
  url = window.location.href,
  type = "website",
  author = "My Memories App Team",
  twitterHandle = "@mymemoriesapp",
  publishedTime,
  modifiedTime,
  section,
  tags
}: SEOProps) {
  const siteTitle = "My Memories App";
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Structured Data (JSON-LD) for Google Rich Results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebSite',
    "headline": fullTitle,
    "image": [image],
    "datePublished": publishedTime,
    "dateModified": modifiedTime,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteTitle,
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png" // Ensure you have a logo
      }
    },
    "description": description
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook / WhatsApp / LinkedIn */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map(tag => <meta property="article:tag" content={tag} key={tag} />)}

      {/* Twitter Cards (X) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
