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
    <div className="text-center py-16 px-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-200 transition-colors duration-300">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <PenTool className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-8">{description}</p>
      
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-3 border border-transparent shadow-md text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105 transition-all duration-200"
        >
          <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
