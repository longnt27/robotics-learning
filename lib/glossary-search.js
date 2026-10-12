/** Text matching shared by UI and tests. Vietnamese without tone marks also works. */
export function normalizeGlossaryText(value) {
  return String(value)
    .toLowerCase()
    .replace(/π/g, "pi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Search prioritizes exact/acronym names over incidental occurrences in a
 * definition, so "ACT" opens the research entry before "action" background.
 * @template {{term:string,aliases:string[],definition:string,category:string}} T
 * @param {readonly T[]} entries
 * @param {string} query
 * @param {string} category
 * @returns {T[]}
 */
export function searchGlossary(entries, query, category = "all") {
  const needle = normalizeGlossaryText(query);
  const tokens = needle.split(/\s+/).filter(Boolean);
  return entries
    .filter((entry) => category === "all" || entry.category === category)
    .map((entry) => {
      const names = [entry.term, ...entry.aliases].map(normalizeGlossaryText);
      const definition = normalizeGlossaryText(entry.definition);
      const content = [...names, definition].join(" ");
      if (tokens.some((token) => !content.includes(token))) return {entry, rank: Infinity};
      const rank = !needle ? 0
        : names.some((name) => name === needle) ? 0
        : names.some((name) => name.startsWith(needle)) ? 1
        : names.some((name) => name.includes(needle)) ? 2
        : definition.includes(needle) ? 3
        : 4;
      return {entry, rank};
    })
    .filter((candidate) => Number.isFinite(candidate.rank))
    .sort((a, b) => a.rank - b.rank || a.entry.term.localeCompare(b.entry.term, "vi", {sensitivity:"base"}))
    .map((candidate) => candidate.entry);
}
