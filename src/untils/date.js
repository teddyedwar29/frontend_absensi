const convertToWIB = (timeString) => {
  if (!timeString || typeof timeString !== "string") return "-";
  try {
    const [h, m, s] = timeString.split(":").map(Number);
    if ([h, m, s].some(isNaN)) return "Invalid Time";

    // Tambahkan 7 jam untuk WIB
    const newHour = (h + 7) % 24;

    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(newHour)}:${pad(m)}:${pad(s)} WIB`;
  } catch (err) {
    console.error(err);
    return "Invalid Time";
  }
};
export { convertToWIB };