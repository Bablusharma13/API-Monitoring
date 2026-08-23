export const isValidUrl = (str) => {
  try {
    const url = new URL(str);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const formatCount = (num) => {
  if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num;
};

export const formatDateTime = (date) => {
  if (!date) return "—";

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0 ms";

  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 1) return `${days.toFixed(1)} days`;
  if (hours >= 1) return `${hours.toFixed(1)} hrs`;
  if (minutes >= 1) return `${minutes.toFixed(1)} min`;
  if (seconds >= 1) return `${seconds.toFixed(1)} sec`;

  return `${ms} ms`;
};
