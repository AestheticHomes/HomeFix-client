export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition-all duration-300";
  const variants = {
    primary:
      "bg-gemini text-white shadow-gemini hover:scale-[1.03]",
    secondary:
      "border border-[#9B5CF8]/40 text-[#5A5DF0] dark:text-[#EC6ECF] hover:bg-[#9B5CF8]/10 dark:hover:bg-[#5A5DF0]/10",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
