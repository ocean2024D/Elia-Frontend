export const abbreviateZone = (zone) => {
  if (!zone) return "";

  const words = zone.split(" ");
  if (words.length < 3) return zone; // Safety check

  // Get the directional part (e.g., "North-West" → "NW")
  const direction = words[0][0] + words[1][0];

  // Get the first two letters of the third word
  let location = words[2].slice(0, 2);

  // If there's a fourth word (e.g., "Schaarbeek Noord"), add its first letter
  if (words.length > 3) {
    location += " " + words[3][0]; // Add a space and first letter of fourth word
  }

  return `${direction} ${location}`;
};
