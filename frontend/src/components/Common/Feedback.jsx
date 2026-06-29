// Returns a CSS class to apply to an input/button for color feedback, or '' if none.
export function feedbackClass(feedback) {
  if (!feedback || feedback.correct === null || feedback.correct === undefined) return '';
  return feedback.correct ? 'flash-correct' : 'flash-wrong';
}
