import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using fallback mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Save form submission to Supabase
 */
export async function saveSubmission(payload, openaiResponse) {
  // 1. Save form submission
  const { data: submission, error: subError } = await supabase
    .from('form_submissions')
    .insert({
      user_email: payload.user.email || null,
      user_first_name: payload.user.first_name,
      user_last_name: payload.user.last_name,
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
      consent_marketing: true,
      consent_timestamp: new Date().toISOString(),
      session_id: generateSessionId(),
    })
    .select()
    .single();

  if (subError) {
    console.error('Error saving submission:', subError);
    throw subError;
  }

  // 2. Save email outputs (only if user provided email and we have OpenAI response)
  if (payload.has_email && openaiResponse?.email_user && openaiResponse?.email_sales) {
    const { error: emailError } = await supabase
      .from('email_outputs')
      .insert({
        submission_id: submission.id,
        email_user_markdown: openaiResponse.email_user.body_markdown,
        email_user_subject: openaiResponse.email_user.subject,
        email_sales_markdown: openaiResponse.email_sales.body_markdown,
        email_sales_subject: openaiResponse.email_sales.subject,
        lead_temperature: openaiResponse.lead_temperature,
      });

    if (emailError) {
      console.error('Error saving email outputs:', emailError);
      // Don't throw here, the main submission was saved
    }
  }

  return submission;
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

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default supabase;
