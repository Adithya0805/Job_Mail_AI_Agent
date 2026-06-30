// Utility to merge existing candidate profiles with new parsed resume results case-insensitively
export function mergeProfiles(existing, newParsed) {
  const merged = { ...existing };

  for (const key in newParsed) {
    if (newParsed[key] === null || newParsed[key] === undefined) {
      continue;
    }

    if (Array.isArray(newParsed[key])) {
      if (key === 'projects') {
        const existingProjects = existing[key] || [];
        const newProjects = newParsed[key] || [];
        const mergedProjects = [...existingProjects];
        
        newProjects.forEach(newProj => {
          const exists = mergedProjects.some(
            oldProj => (oldProj.name || '').trim().toLowerCase() === (newProj.name || '').trim().toLowerCase()
          );
          if (!exists) {
            mergedProjects.push(newProj);
          } else {
            const idx = mergedProjects.findIndex(
              oldProj => (oldProj.name || '').trim().toLowerCase() === (newProj.name || '').trim().toLowerCase()
            );
            mergedProjects[idx] = {
              ...mergedProjects[idx],
              description: newProj.description || mergedProjects[idx].description,
              tech_stack: newProj.tech_stack || mergedProjects[idx].tech_stack,
              live_url: newProj.live_url || mergedProjects[idx].live_url,
            };
          }
        });
        merged[key] = mergedProjects;
      } else {
        // Flat string array (skills_languages, skills_frameworks, skills_ai_ml, certifications)
        const existingArray = existing[key] || [];
        const newArray = newParsed[key] || [];
        const mergedArray = [...existingArray];
        
        newArray.forEach(item => {
          if (!item) return;
          const exists = mergedArray.some(
            oldItem => (oldItem || '').trim().toLowerCase() === (item || '').trim().toLowerCase()
          );
          if (!exists) {
            mergedArray.push(item);
          }
        });
        merged[key] = mergedArray;
      }
    } else {
      // Direct primitives (string, number)
      // Overwrite if newParsed has a non-empty string/number value
      if (newParsed[key] !== '' && newParsed[key] !== null) {
        merged[key] = newParsed[key];
      }
    }
  }

  return merged;
}
