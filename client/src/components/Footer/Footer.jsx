const Footer = ({ className = "" }) => {
  return (
    <footer className={`text-center py-4 ${className}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Finora · Developed by{" "}
        <span className="font-medium text-emerald-600">SAJ</span>
      </p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
        All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;