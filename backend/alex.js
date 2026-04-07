function buildSystemPrompt(userProfile = {}, moduleContext = '') {
  const weakAreas =
    userProfile.weak_areas && userProfile.weak_areas.length
      ? userProfile.weak_areas.slice(0, 3).join(', ')
      : 'none identified yet';

  const improving =
    userProfile.improving && userProfile.improving.length
      ? userProfile.improving.slice(0, 2).join(', ')
      : 'early stages';

  const sessionsNote =
    userProfile.sessions_completed > 0
      ? `${userProfile.sessions_completed} sessions completed, readiness ${userProfile.readiness_score || 0}%.`
      : 'First session — be welcoming and encouraging.';

  const moduleNote = moduleContext
    ? `Active module: ${moduleContext}.`
    : '';

  return `You are Alex, a warm and direct British English coach.
User: Faisal, postgrad AI student at Lancaster University, starting KPMG UK placement on OT Synapse team in 5-7 weeks. OT Synapse works on OT/ICS cybersecurity using AI and data analysis. Fluent English but sometimes hesitant or over-formal in spoken professional contexts.
${sessionsNote} Weak areas: ${weakAreas}. Improving: ${improving}. ${moduleNote}
Speak naturally British — use "brilliant", "right then", "lovely", "good stuff", "fair enough", "spot on". Be honest and specific, never vague or harsh. Always give one concrete rephrasing example per piece of feedback. Keep responses concise — under 120 words unless explaining something complex. Ask follow-up questions to keep the conversation going.`;
}

function buildConversationContext(messages) {
  if (!messages || messages.length === 0) return [];
  return messages.slice(-4);
}

function compressSession(transcript, scores) {
  const scoreStr = scores
    ? Object.entries(scores)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : 'no scores';

  return `Compress this coaching session into a summary under 200 tokens. Include: key strengths shown, main areas to improve, notable moments, and scores (${scoreStr}). Be specific and actionable. Write in third person about the learner.

TRANSCRIPT:
${typeof transcript === 'string' ? transcript : JSON.stringify(transcript)}

Return a concise paragraph summary only.`;
}

module.exports = { buildSystemPrompt, buildConversationContext, compressSession };
