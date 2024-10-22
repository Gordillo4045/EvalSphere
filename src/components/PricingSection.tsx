// src/components/PricingSection.tsx
import React from 'react';

const PricingSection: React.FC = () => {
  return (
    <div className="rounded-3xl shadow-2xl flex flex-col items-center py-16 dark:bg-neutral-900 border">
      <div className="flex flex-wrap justify-center gap-2"> 
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-72 transform transition-transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-4">Plan</h3>
          <p className="text-3xl font-bold mb-4">$0.00/?</p>
          <ul className="mb-6 space-y-2">
            <li>Característica 1</li>
            <li>Característica 2</li>
          </ul>
          <div className='pt-14'>
            <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Comprar</button>
          </div>
          
        </div>
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-72 transform transition-transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-4">Plan</h3>
          <p className="text-3xl font-bold mb-4">$0.00/?</p>
          <ul className="mb-6 space-y-2">
            <li>Característica 1</li>
            <li>Característica 2</li>
            <li>Característica 3</li>
            <li>Característica 4</li>
          </ul>
          <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Comprar</button>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;