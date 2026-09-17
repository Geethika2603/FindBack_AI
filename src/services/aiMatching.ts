import { LostItem, FoundItem, MatchFactors } from '../types';

function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'with', 'and', 'or', 'is', 'it', 'my', 'of', 'for', 'to', 'has', 'near'
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

export function compute7FactorMatch(lost: LostItem, found: FoundItem): MatchFactors {
  const highlights: string[] = [];

  // 1. Image Similarity (35%)
  let imageScore = 50;
  if (lost.imageUrl && found.imageUrl) {
    const sameCat = lost.category.toLowerCase().trim() === found.category.toLowerCase().trim();
    const sameColor = lost.color.toLowerCase().trim() === found.color.toLowerCase().trim();
    if (sameCat && sameColor) {
      imageScore = 92;
      highlights.push('Visual contour & color palette alignment');
    } else if (sameCat || sameColor) {
      imageScore = 78;
      highlights.push('Partial visual contour match');
    } else {
      imageScore = 45;
    }
  } else if (lost.imageUrl || found.imageUrl) {
    imageScore = 65;
    highlights.push('Single visual reference checked');
  }

  // 2. Text / Description Similarity (20%)
  const lostTokens = tokenize(`${lost.title} ${lost.description}`);
  const foundTokens = tokenize(`${found.title} ${found.description}`);
  let sharedTokensCount = 0;
  lostTokens.forEach((t) => {
    if (foundTokens.has(t)) {
      sharedTokensCount++;
    }
  });
  const minTokenSize = Math.min(lostTokens.size, foundTokens.size) || 1;
  const overlapRatio = sharedTokensCount / minTokenSize;
  const textScore = Math.min(100, Math.round(Math.max(25, overlapRatio * 95)));
  if (sharedTokensCount > 0) {
    highlights.push(`${sharedTokensCount} keyword match${sharedTokensCount > 1 ? 'es' : ''} in description`);
  }

  // 3. Color Similarity (10%)
  const lostColor = (lost.color || '').toLowerCase().trim();
  const foundColor = (found.color || '').toLowerCase().trim();
  let colorScore = 20;
  if (lostColor && foundColor) {
    if (lostColor === foundColor) {
      colorScore = 100;
      highlights.push(`Identical color: ${lost.color}`);
    } else if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      colorScore = 90;
      highlights.push(`Color match: ${lost.color} ~ ${found.color}`);
    } else {
      colorScore = 25;
    }
  }

  // 4. Brand Similarity (10%)
  const lostBrand = (lost.brand || '').toLowerCase().trim();
  const foundBrand = (found.brand || '').toLowerCase().trim();
  let brandScore = 30;
  if (lostBrand && foundBrand) {
    if (lostBrand === foundBrand && lostBrand !== 'generic' && lostBrand !== 'unknown') {
      brandScore = 100;
      highlights.push(`Brand confirmed: ${lost.brand}`);
    } else if (lostBrand === 'generic' || foundBrand === 'generic' || lostBrand === 'unknown' || foundBrand === 'unknown') {
      brandScore = 75;
    } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      brandScore = 90;
      highlights.push(`Brand alignment: ${lost.brand}`);
    } else {
      brandScore = 15;
    }
  }

  // 5. Category Similarity (5%)
  const lostCat = (lost.category || '').toLowerCase().trim();
  const foundCat = (found.category || '').toLowerCase().trim();
  let categoryScore = 10;
  if (lostCat && foundCat) {
    if (lostCat === foundCat) {
      categoryScore = 100;
      highlights.push(`Category match: ${lost.category}`);
    } else if (lostCat.includes(foundCat) || foundCat.includes(lostCat)) {
      categoryScore = 60;
    } else {
      categoryScore = 0;
    }
  }

  // 6. Location Proximity (10%)
  const lostLoc = (lost.location || '').toLowerCase().trim();
  const foundLoc = (found.location || '').toLowerCase().trim();
  let locationScore = 30;
  if (lostLoc && foundLoc) {
    if (lostLoc === foundLoc) {
      locationScore = 100;
      highlights.push(`Identical location: ${lost.location}`);
    } else {
      const locKeywords = ['library', 'union', 'gym', 'reception', 'science', 'hall', 'campus', 'center', 'lab', 'dining'];
      const sharedLocKw = locKeywords.filter((k) => lostLoc.includes(k) && foundLoc.includes(k));
      if (sharedLocKw.length > 0) {
        locationScore = 90;
        highlights.push(`Same campus zone: ${lost.location} & ${found.location}`);
      } else {
        locationScore = 40;
      }
    }
  }

  // 7. Time Compatibility (10%)
  let timeScore = 80;
  try {
    const d1 = new Date(lost.dateLost).getTime();
    const d2 = new Date(found.dateFound).getTime();
    if (!isNaN(d1) && !isNaN(d2)) {
      const diffHours = (d2 - d1) / (1000 * 60 * 60);
      if (diffHours < -24) {
        timeScore = 20; // found before lost
      } else if (diffHours >= -24 && diffHours <= 48) {
        timeScore = 95;
        highlights.push('Temporal match: within 48 hours');
      } else if (diffHours <= 120) {
        timeScore = 85;
      } else {
        timeScore = 60;
      }
    }
  } catch {
    timeScore = 75;
  }

  // Calculate Weighted 7-Factor Overall Score
  // Image (35%) + Text (20%) + Color (10%) + Brand (10%) + Category (5%) + Location (10%) + Time (10%)
  const overallScore = Math.min(
    100,
    Math.round(
      imageScore * 0.35 +
      textScore * 0.20 +
      colorScore * 0.10 +
      brandScore * 0.10 +
      categoryScore * 0.05 +
      locationScore * 0.10 +
      timeScore * 0.10
    )
  );

  return {
    imageScore,
    textScore,
    colorScore,
    brandScore,
    categoryScore,
    locationScore,
    timeScore,
    overallScore,
    matchedHighlights: highlights.slice(0, 4)
  };
}

