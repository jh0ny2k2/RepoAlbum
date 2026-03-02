import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, PenTool } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
}

export default function EmptyState({ 
  title = "No memories yet", 
  description = "Start documenting your journey. Every moment counts.", 
  actionLabel = "Create your first memory",
  actionLink = "/app/memories/new"
}: EmptyStateProps) {
  return (
    <div className="text-center py-24 px-6 bg-card rounded-2xl border border-dashed border-border hover:border-foreground/20 transition-all duration-300">
      <div className="w-20 h-20 bg-secondary text-foreground rounded-full flex items-center justify-center mx-auto mb-6">
        <PenTool className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg font-light leading-relaxed">{description}</p>
      
      {actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center px-8 py-3.5 text-base font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground transform hover:-translate-y-1 transition-all duration-300 shadow-md"
        >
          <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {actionLabel}
        </Link>
      ) : (
        <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-8 py-3.5 border border-border text-base font-medium rounded-full text-foreground bg-background hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground transition-all duration-300"
        >
            {actionLabel}
        </button>
      )}
    </div>
  );
}
