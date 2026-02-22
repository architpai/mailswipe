import React from 'react';
import { Link } from 'react-router-dom';

const versions = [
  {
    id: 1,
    name: 'Neon Noir',
    description: 'Dark mode with glowing neon accents and cyberpunk gradients',
    colors: ['#0a0a0f', '#00d4ff', '#ff2d7b', '#a855f7'],
  },
  {
    id: 2,
    name: 'Soft Organic',
    description: 'Warm cream backgrounds with peach, sage, and lavender pastels',
    colors: ['#fdf6ee', '#ffb88c', '#a3b18a', '#c8b6ff'],
  },
  {
    id: 3,
    name: 'Brutalist Mono',
    description: 'Black and white with monospace typography and raw edges',
    colors: ['#ffffff', '#000000', '#ff0000', '#000000'],
  },
  {
    id: 4,
    name: 'Aurora Glass',
    description: 'Frosted glass panels over animated gradient mesh backgrounds',
    colors: ['#0d9488', '#7c3aed', '#4f46e5', '#ec4899'],
  },
  {
    id: 5,
    name: 'Newspaper / Editorial',
    description: 'Serif typography with elegant rules and editorial styling',
    colors: ['#faf8f2', '#1a1a1a', '#c41e3a', '#b8860b'],
  },
];

export default function VersionPicker() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">MailSwipe</h1>
      <p className="text-slate-500 mb-10">Choose a visual version to explore</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {versions.map((v) => (
          <Link
            key={v.id}
            to={`/${v.id}`}
            className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex gap-1.5 mb-4">
              {v.colors.map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg border border-slate-200"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              {v.id}. {v.name}
            </h2>
            <p className="text-sm text-slate-500">{v.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
