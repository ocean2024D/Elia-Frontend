export const abbreviateZone = (zone) => {
  if (!zone) return "";

  // Define possible direction prefixes
  const directions = ["North-West", "North-East", "South-West", "South-East"];

  const words = zone.split(" ");
  if (words.length < 2) return zone; // Safety check

  // Find if the zone starts with a known direction
  const direction = directions.find((dir) => zone.startsWith(dir));

  if (!direction) return zone; // If no direction is found, return the original string

  // Remove the direction from the words array
  const remainingWords = zone.replace(direction, "").trim().split(" ");

  // Construct the abbreviation
  let abbreviation = direction
    .split("-")
    .map((word) => word[0]) // Take first letter of "North" & "West"
    .join(""); // Join them as "NW", "NE", etc.

  // Append the first word of the remaining location
  let location = remainingWords[0];

  // If there's a fourth word, add its first letter
  if (remainingWords.length > 1) {
    location += " " + remainingWords[1][0]; // e.g., "Schaarbeek Noord" → "Schaarbeek N"
  }

  return `${abbreviation} ${location}`;
};
