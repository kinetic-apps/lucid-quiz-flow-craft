import React from 'react';
import { Link } from 'react-router-dom';

type NotFoundProps = {
  title?: string;
  message?: string;
  linkText?: string;
  linkTo?: string;
};

const NotFound: React.FC<NotFoundProps> = ({
  title = 'Page Not Found',
  message = 'The page you\'re looking for doesn\'t exist or has been moved.',
  linkText = 'Return Home',
  linkTo = '/'
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="bg-red-500 text-white p-4 rounded-md mb-6">
          <p className="font-bold">Error</p>
          <p>{message}</p>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Failed to load quiz
        </h1>
        
        <p className="text-gray-600 mb-8">
          The quiz you're looking for doesn't exist or couldn't be loaded.
        </p>
        
        <Link 
          to={linkTo}
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
