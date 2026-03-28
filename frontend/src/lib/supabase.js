/**
 * form_submissions: insert after analysis (insertFormSubmissionAfterAnalysis), then UPDATE on lead
 * (finalizeFormSubmissionLead). saveSubmission = one-shot INSERT if no submissionId.
 * email_outputs: INSERT only when lead + full OpenAI email bodies (Dreamlit).
 */
import { createClient } from '@supabase/supabase-js';
import { createLog, createLogUpdate } from './debugLogger';

// Global reference to debug context (set by useDebugContext)
let debugContextRef = null;

export function setDebugContext(context) {
  debugContextRef = context;
}

function addDebugLog(log) {
  if (debugContextRef?.isDebugMode && debugContextRef?.addLog) {
    return debugContextRef.addLog(log);
  }
  return null;
}

function updateDebugLog(logId, update) {
  if (debugContextRef?.isDebugMode && debugContextRef?.updateLog && logId) {
    debugContextRef.updateLog(logId, update);
  }
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder') && supabaseAnonKey !== 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Credentials not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your build environment (e.g. Railway Variables) and redeploy.'
  );
}

export const supabase = createClient(
  supabaseUrl && !supabaseUrl.includes('placeholder') ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey && supabaseAnonKey !== 'placeholder-key' ? supabaseAnonKey : 'placeholder-key'
);

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Dreamlit: insert email_outputs only when lead + full OpenAI email bodies.
 */
async function insertEmailOutputsIfComplete(submissionId, payload, openaiResponse) {
  const hasFullEmailOutputs =
    payload.has_email &&
    openaiResponse?.email_user &&
    openaiResponse?.email_sales &&
    typeof openaiResponse.email_user === 'object' &&
    typeof openaiResponse.email_sales === 'object' &&
    openaiResponse.email_user?.body_markdown != null &&
    openaiResponse.email_sales?.body_markdown != null;

  if (!hasFullEmailOutputs && payload.has_email) {
    console.warn(
      '[Supabase] email_outputs not written: OpenAI did not return email_user and/or email_sales with body_markdown. ' +
        'Dreamlit needs full content on insert to send emails. Check assistant instructions so it returns { "email_user": { "subject": "...", "body_markdown": "..." }, "email_sales": { ... } }. ' +
        'Current: email_user=' +
        (openaiResponse?.email_user ? 'present' : 'null') +
        ', email_sales=' +
        (openaiResponse?.email_sales ? 'present' : 'null')
    );
  }

  if (!hasFullEmailOutputs) return;

  const emailLogId = addDebugLog(createLog('supabase', 'insert.email_outputs', {
    endpoint: 'email_outputs',
    method: 'INSERT',
    payload: {
      submission_id: submissionId,
      user_email: payload.user.email,
      lead_temperature: openaiResponse.lead_temperature,
    },
  }));

  const emailStartTime = Date.now();

  const { error: emailError } = await supabase
    .from('email_outputs')
    .insert({
      submission_id: submissionId,
      user_email: payload.user.email,
      lead_temperature: openaiResponse.lead_temperature,
      email_user_subject: openaiResponse.email_user.subject,
      email_user_markdown: openaiResponse.email_user.body_markdown,
      email_sales_subject: openaiResponse.email_sales.subject,
      email_sales_markdown: openaiResponse.email_sales.body_markdown,
    });

  updateDebugLog(emailLogId, createLogUpdate(
    { error: emailError },
    Date.now() - emailStartTime,
    emailError ? 'error' : 'success'
  ));

  if (emailError) {
    console.error('Error saving email outputs:', emailError);
  }
}

/**
 * Insert form_submissions row (shared by analysis-only and full lead path).
 */
async function insertFormSubmissionRow(payload, openaiResponse, { consentMarketing, consentTimestamp }) {
  const formLogId = addDebugLog(createLog('supabase', 'insert.form_submissions', {
    endpoint: 'form_submissions',
    method: 'INSERT',
    payload: {
      answers: payload.answers,
      score: payload.score,
      user: payload.user,
    },
    isHighlighted: true,
    highlightReason: 'form_data',
  }));

  const startTime = Date.now();
  const sessionId = generateSessionId();

  const { data: submission, error: subError } = await supabase
    .from('form_submissions')
    .insert({
      user_email: payload.user.email || null,
      user_first_name: payload.user.first_name ?? '',
      user_last_name: payload.user.last_name || '',
      company_name: payload.user.company,
      company_size: payload.user.size || null,
      industry: payload.user.industry || null,
      canton: payload.user.canton || null,
      answers: payload.answers,
      score_raw: payload.score.value,
      score_normalized: payload.score.normalized,
      risk_level: payload.score.level,
      teaser_text: openaiResponse?.teaser || null,
      lead_temperature: openaiResponse?.lead_temperature || null,
      status: openaiResponse ? 'teaser_ready' : 'pending',
      consent_marketing: consentMarketing,
      consent_timestamp: consentTimestamp,
      session_id: sessionId,
    })
    .select()
    .single();

  updateDebugLog(formLogId, createLogUpdate(
    { data: submission, error: subError },
    Date.now() - startTime,
    subError ? 'error' : 'success'
  ));

  if (subError) {
    console.error('Error saving submission:', subError);
    if (!isSupabaseConfigured) {
      console.error('[Supabase] Configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Railway (or your host) Variables, then redeploy.');
    }
    throw subError;
  }

  await insertEmailOutputsIfComplete(submission.id, payload, openaiResponse);

  return submission;
}

/**
 * After OpenAI analysis (no lead yet): persist answers + teaser so abandons are captured.
 * consent_marketing false until the user submits the lead form.
 */
export async function insertFormSubmissionAfterAnalysis(payload, openaiResponse) {
  return insertFormSubmissionRow(payload, openaiResponse, {
    consentMarketing: false,
    consentTimestamp: null,
  });
}

/**
 * After lead form: update row created at analysis time, then email_outputs if applicable.
 */
export async function finalizeFormSubmissionLead(submissionId, payload, openaiResponse) {
  const logId = addDebugLog(createLog('supabase', 'update.form_submissions.lead', {
    endpoint: 'form_submissions',
    method: 'UPDATE',
    payload: { id: submissionId, user: payload.user },
  }));
  const t0 = Date.now();

  const { data: updatedRows, error: updError } = await supabase
    .from('form_submissions')
    .update({
      user_email: payload.user.email || null,
      user_first_name: payload.user.first_name ?? '',
      user_last_name: payload.user.last_name || '',
      company_name: payload.user.company,
      company_size: payload.user.size || null,
      industry: payload.user.industry || null,
      canton: payload.user.canton || null,
      consent_marketing: true,
      consent_timestamp: new Date().toISOString(),
      status: 'lead_complete',
    })
    .eq('id', submissionId)
    .select('id');

  updateDebugLog(logId, createLogUpdate(
    { data: updatedRows, error: updError },
    Date.now() - t0,
    updError ? 'error' : 'success'
  ));

  if (updError) {
    console.error('Error updating submission with lead:', updError);
    throw updError;
  }
  if (!updatedRows?.length) {
    const msg =
      '[Supabase] UPDATE form_submissions matched 0 rows. Usually missing RLS policy "Allow anon update on form_submissions" ' +
      'or wrong submission id. Run the policy from docs/supabase-schema-update.sql in the SQL Editor.';
    console.error(msg);
    throw new Error(msg);
  }

  await insertEmailOutputsIfComplete(submissionId, payload, openaiResponse);

  return { id: submissionId };
}

/**
 * Full insert in one shot (fallback when no row was created after analysis, e.g. failed insert or refreshed session).
 * Same as historical saveSubmission behavior.
 */
export async function saveSubmission(payload, openaiResponse) {
  return insertFormSubmissionRow(payload, openaiResponse, {
    consentMarketing: true,
    consentTimestamp: new Date().toISOString(),
  });
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(submissionId, status, teaserText = null) {
  const updateData = { status };
  if (teaserText) {
    updateData.teaser_text = teaserText;
  }

  const { error } = await supabase
    .from('form_submissions')
    .update(updateData)
    .eq('id', submissionId);

  if (error) {
    console.error('Error updating submission status:', error);
    throw error;
  }
}

export default supabase;
