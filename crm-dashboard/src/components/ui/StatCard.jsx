/**
 * StatCard - A reusable statistics display card component
 * 
 * @description Displays a metric value with an icon and label, commonly used in dashboards
 * to show key performance indicators (KPIs) or summary statistics.
 * 
 * @example
 * // Basic usage
 * <StatCard
 *   icon={<UsersIcon />}
 *   value="1,234"
 *   label="Total Users"
 * />
 * 
 * @example
 * // With custom styling and loading state
 * <StatCard
 *   icon={<RevenueIcon />}
 *   iconBg="bg-green-100"
 *   value="$45,000"
 *   valueColor="text-green-600"
 *   label="Monthly Revenue"
 *   isLoading={false}
 * />
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon element to display in the icon bubble
 * @param {string} [props.iconBg="bg-gray-100"] - Tailwind classes for icon background color
 * @param {string|number} props.value - The main statistic value to display
 * @param {string} [props.valueColor="text-gray-900"] - Tailwind classes for value text color
 * @param {string} props.label - Descriptive label for the statistic
 * @param {string} [props.iconClassName] - Additional Tailwind classes for the icon container
 * @param {boolean} [props.isLoading=false] - Shows loading placeholder when true
 */
export function StatCard({
  icon,
  iconBg = "bg-gray-100",
  value,
  valueColor = "text-gray-900",
  label,
  iconClassName,
  isLoading = false,
}) {
  return (
    <div className="wrapper-card">
      {/* Icon bubble */}
      <div className={` statcard-icon `}>{icon}</div>
      {/* Text */}
      <div>
        <div className={`statcard-value  ${valueColor}`}>
          {isLoading ? "—" : value}
        </div>
        <div className={`statcard-label`}>{label}</div>
      </div>
    </div>
  );
}
