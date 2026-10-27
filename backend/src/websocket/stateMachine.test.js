const { processReportStep, STATES } = require('./stateMachine');

async function runStateMachineTest() {
  console.log('Testing Chat Report State Machine...');
  const userId = 'test_user_sim_123';

  // Step 1: Start
  let res = await processReportStep(userId, 'Quiero reportar un bache peligroso');
  console.log('Step 1:', res.state === STATES.ASK_CATEGORY ? 'PASS' : 'FAIL', `(State: ${res.state})`);

  // Step 2: Category
  res = await processReportStep(userId, '3');
  console.log('Step 2:', res.state === STATES.ASK_DESCRIPTION ? 'PASS' : 'FAIL', `(State: ${res.state})`);

  // Step 3: Description
  res = await processReportStep(userId, 'Bache profundo en el carril derecho frente a la plaza');
  console.log('Step 3:', res.state === STATES.ASK_LOCATION ? 'PASS' : 'FAIL', `(State: ${res.state})`);

  // Step 4: Location
  res = await processReportStep(userId, 'Plaza Abaroa, Sopocachi');
  console.log('Step 4:', res.state === STATES.ASK_PHOTO ? 'PASS' : 'FAIL', `(State: ${res.state})`);

  // Step 5: Photo (skip)
  res = await processReportStep(userId, '1');
  console.log('Step 5:', res.state === STATES.CONFIRM ? 'PASS' : 'FAIL', `(State: ${res.state})`);

  // Step 6: Confirm
  res = await processReportStep(userId, 'SÍ');
  console.log('Step 6:', res.state === STATES.DONE ? 'PASS' : 'FAIL', `(State: ${res.state}, ReportId: ${res.reportId})`);

  if (res.state === STATES.DONE && res.reportId) {
    console.log('SUCCESS: Full E2E conversation flow created report successfully.');
  } else {
    console.error('FAILED: Report creation flow did not complete.');
    process.exit(1);
  }

  console.log('Testing Natural Language Category Classification...');
  const nlUserId = 'test_user_nl_cat';
  await processReportStep(nlUserId, 'reportar');
  const catRes1 = await processReportStep(nlUserId, 'paso un incendio cerca de mi casa');
  console.log('NL Category (Incendio):', catRes1.text.includes('Incendio / Fuga de gas') ? 'PASS' : 'FAIL');

  const catRes2 = await processReportStep('user_nl_infra', 'reportar');
  const catRes2Step = await processReportStep('user_nl_infra', 'hay un bache tremendo y no hay luz');
  console.log('NL Category (Infraestructura):', catRes2Step.text.includes('Infraestructura / Bache / Luminaria') ? 'PASS' : 'FAIL');
}

runStateMachineTest();

