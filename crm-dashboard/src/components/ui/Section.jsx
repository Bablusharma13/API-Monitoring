/**
 * Section - A layout wrapper component for page sections
 * 
 * @description Wraps content in a styled section container. Use this to create
 * distinct visual sections within a page, providing consistent spacing and
 * background styling throughout the application.
 * 
 * @example
 * // Basic usage
 * <Section>
 *   <h2>Dashboard Overview</h2>
 *   <StatCards />
 * </Section>
 * 
 * @example
 * // Multiple sections
 * <Section>
 *   <PageHeader title="Analytics" />
 * </Section>
 * 
 * <Section>
 *   <Chart data={analyticsData} />
 * </Section>
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render inside the section
 */
export const Section = ({ children, className = "" }) => {
  return <section className={["section", className].filter(Boolean).join(" ")}>{children}</section>;
};
