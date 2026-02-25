import React from 'react';
import { CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-indigo-600 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            About Our Mission
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
            We are dedicated to providing the best development experience for building modern web applications.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Built for Developers
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              This project serves as a comprehensive starting point for your next big idea. 
              We've handled the configuration so you can focus on writing code.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Pre-configured Vite setup',
                'TypeScript support out of the box',
                'Tailwind CSS for rapid styling',
                'Responsive and accessible components'
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-base text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0">
            <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-xl">
              <img
                className="object-cover w-full h-full rounded-xl"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
                alt="People working together"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="bg-gray-50 pt-12 sm:pt-16 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by developers worldwide
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Our templates are used by thousands of developers to kickstart their projects.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Downloads</dt>
              <dd className="order-1 text-5xl font-extrabold text-indigo-600">100k+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Stars</dt>
              <dd className="order-1 text-5xl font-extrabold text-indigo-600">5k+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Contributors</dt>
              <dd className="order-1 text-5xl font-extrabold text-indigo-600">200+</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default About;
