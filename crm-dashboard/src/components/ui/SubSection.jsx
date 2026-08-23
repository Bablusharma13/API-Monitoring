/**
 * SubSection - A nested layout wrapper for grouped content
 * 
 * @description A smaller-scale container for grouping related content within a Section.
 * Use this when you need to create visual hierarchy or group related items together
 * inside a parent Section component.
 * 
 * @example
 * // Basic usage within a Section
 * <Section>
 *   <h3>Recent Activity</h3>
 *   <SubSection>
 *     <ActivityItem />
 *     <ActivityItem />
 *   </SubSection>
 * </Section>
 * 
 * @example
 * // Multiple sub-sections
 * <Section>
 *   <SubSection>
 *     <StatCard value="100" label="Active" />
 *     <StatCard value="25" label="Pending" />
 *   </SubSection>
 *   
 *   <SubSection>
 *     <Chart type="line" />
 *   </SubSection>
 * </Section>
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render inside the sub-section
 */
export const SubSection = ({ children }) => {
  return <div className="sub-section">{children}</div>;
};
