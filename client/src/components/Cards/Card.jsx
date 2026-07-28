const Card = ({ children, title, className = "", ...props }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;