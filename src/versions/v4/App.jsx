import React from 'react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Version 4: Aurora Glass — Coming Soon</h1>
        <Link to="/" className="text-blue-600 hover:underline">&larr; Back to picker</Link>
      </div>
    </div>
  );
}
