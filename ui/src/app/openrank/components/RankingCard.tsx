import React from 'react';

interface RankingCardProps {
  title: string;
  children: React.ReactNode;
}

const RankingCard = ({ title, children }: RankingCardProps) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
      {children}
    </div>
  );
};

export default RankingCard;
