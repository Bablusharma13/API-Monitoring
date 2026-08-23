export const IntitialLoader = ({
  text = "Preparing Your Billing Dashboard...",
}) => {
  return (
    //   <div className="loader-overlay">
    //       <div className="loader-spinner" />
    //       <p className="loader-text">{text}</p>
    //     </div>
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-7">
      {/* Dual counter-spin rings */}
      <div className="relative w-16 h-16">
        <span
          className="absolute inset-0 rounded-full border-4 border-transparent
          border-t-blue-700 border-r-blue-700 animate-spin"
        />
        <span
          className="absolute inset-3 rounded-full border-4 border-transparent
          border-b-blue-300 border-l-blue-300"
          style={{ animation: "spin .7s linear infinite reverse" }}
        />
      </div>
      {/* Text */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-medium tracking-widest uppercase text-blue-700">
          {text}
        </p>
        {/* <p className="text-xs tracking-wide text-blue-300">{sub}</p> */}
      </div>
    </div>
  );
};
