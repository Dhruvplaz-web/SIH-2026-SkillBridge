export function cuid(): string {
  return 'c' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { offset, limit };
}

export function calculateProfileCompletion(profile: any, user: any, skills: any[]): number {
  let score = 0;
  if (user.name) score += 10;
  if (user.bio) score += 10;
  if (user.phone) score += 5;
  if (profile?.institution) score += 10;
  if (profile?.branch) score += 10;
  if (profile?.education) score += 10;
  if (profile?.graduation_year) score += 5;
  if (profile?.cgpa) score += 5;
  if (profile?.interests) score += 5;
  if (profile?.career_preferences) score += 5;
  if (profile?.linkedin_url) score += 5;
  if (profile?.github_url) score += 5;
  if (profile?.resume_url) score += 5;
  if (skills.length >= 3) score += 10;
  return Math.min(score, 100);
}

export function mapScoreToProficiency(percentage: number): string {
  if (percentage >= 80) return 'ADVANCED';
  if (percentage >= 50) return 'INTERMEDIATE';
  return 'BEGINNER';
}
