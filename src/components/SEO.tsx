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
  title, 
  description = "Lumina Memories - La forma más segura y elegante de guardar tus recuerdos. Crea álbumes privados, comparte con amigos y familia, y revive tus momentos especiales. Ideal para bodas y eventos.", 
  keywords = "Lumina Memories, álbum de fotos online, galería privada, fotos de boda, compartir fotos, almacenamiento seguro de fotos, álbum digital, recuerdos",
  image = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop", // Una imagen más evocadora (boda/evento)
  url = window.location.href,
  type = "website",
  author = "Lumina Team",
  twitterHandle = "@luminamemories",
  publishedTime,
  modifiedTime,
  section,
  tags
}: SEOProps) {
  const siteTitle = "Lumina Memories";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  // Structured Data (JSON-LD) for Google Rich Results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebSite',
    "name": fullTitle,
    "headline": fullTitle,
    "image": [image],
    "datePublished": publishedTime,
    "dateModified": modifiedTime,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteTitle,
      "logo": {
        "@type": "ImageObject",
        "url": "https://luminamemories.netlify.app/logo.png" 
      }
    },
    "description": description,
    "url": url
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
      <meta property="og:locale" content="es_ES" />
      <meta property="og:locale:alternate" content="en_US" />
      
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
      <meta name="twitter:image:alt" content={title || siteTitle} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}