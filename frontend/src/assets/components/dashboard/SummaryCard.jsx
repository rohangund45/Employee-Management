import React from 'react';

const SummaryCard = ({ icon: Icon, text, number, color }) => {
  return (
    <div className="bg-white shadow-md p-4 rounded flex items-center gap-4 w-full">
      <div className={`text-3xl text-white p-3 rounded-full ${color}`}>
        <Icon />
      </div>
      <div>
        <p className="text-gray-600">{text}</p>
        <p className="text-xl font-bold">{number}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
