const StatsCard = ({
  title,
  value,
  icon: IconComponent,
  gradient,
  textColor = "text-white",
  border = "",
}) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-md p-3 sm:p-5 text-white shadow-sm ${border}`}>
      <div className={`flex justify-between items-start ${textColor}`}>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm opacity-90 mb-1 truncate">{title}</div>
          <div className="text-xl sm:text-3xl font-bold truncate">{value}</div>
        </div>

        {IconComponent && (
          <div className="bg-white bg-opacity-25 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0">
            <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;