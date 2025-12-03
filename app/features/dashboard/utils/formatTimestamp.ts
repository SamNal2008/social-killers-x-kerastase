export const formatTimestamp = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours || 12; // Convert 0 to 12

  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours}:${minutesStr} ${ampm}`;
};
