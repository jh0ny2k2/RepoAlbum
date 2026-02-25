// Helper functions for visual effects

export const getSeasonColor = (date: string | Date) => {
  const month = new Date(date).getMonth();
  // Tailwind gradient classes or hex colors
  const seasons: Record<number, string> = {
    0: 'from-blue-200 to-indigo-200',  // Jan - Winter
    1: 'from-indigo-200 to-purple-200', // Feb - Winter
    2: 'from-pink-200 to-rose-200',    // Mar - Spring
    3: 'from-rose-200 to-red-200',     // Apr - Spring
    4: 'from-green-200 to-emerald-200', // May - Spring
    5: 'from-yellow-200 to-amber-200', // Jun - Summer
    6: 'from-amber-200 to-orange-200', // Jul - Summer
    7: 'from-orange-200 to-red-200',   // Aug - Summer
    8: 'from-yellow-100 to-amber-100', // Sep - Autumn
    9: 'from-orange-100 to-amber-200', // Oct - Autumn
    10: 'from-slate-200 to-gray-300',  // Nov - Autumn
    11: 'from-blue-100 to-slate-200'   // Dec - Winter
  };
  return seasons[month] || 'from-gray-100 to-gray-200';
};

export const getMoodColor = (content: string) => {
  // Simple sentiment analysis based on keywords
  const positive = ['feliz', 'amor', 'excelente', 'maravilloso', 'increíble', 'happy', 'love', 'great', 'amazing', 'good'];
  const negative = ['triste', 'difícil', 'duro', 'tristeza', 'problema', 'sad', 'hard', 'bad', 'problem', 'pain'];
  
  const words = content.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(w => positive.includes(w)).length;
  const negativeCount = words.filter(w => negative.includes(w)).length;
  
  if (positiveCount > negativeCount) return 'border-emerald-400';
  if (negativeCount > positiveCount) return 'border-rose-400';
  return 'border-transparent'; // Neutral
};
