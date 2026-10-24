const { processReportStep } = require('../stateMachine');

/**
 * Handler for report creation workflow via chat
 */
async function createHandler({ userId, message }) {
  const result = await processReportStep(userId, message);
  return {
    type: 'message',
    intent: 'create',
    state: result.state,
    reportId: result.reportId,
    text: result.text,
    suggestedActions: result.suggestedActions,
  };
}

module.exports = createHandler;

