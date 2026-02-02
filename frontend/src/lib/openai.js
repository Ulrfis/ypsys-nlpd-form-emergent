import OpenAI from 'openai';
import { createLog, createLogUpdate } from './debugLogger';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;

// Global reference to debug context (set by useDebugContext)
let openaiDebugContextRef = null;

export function setOpenAIDebugContext(context) {
  openaiDebugContextRef = context;
}

function addDebugLog(log) {
  if (openaiDebugContextRef?.isDebugMode && openaiDebugContextRef?.addLog) {
    return openaiDebugContextRef.addLog(log);
  }
  return null;
}

function updateDebugLog(logId, update) {
  if (openaiDebugContextRef?.isDebugMode && openaiDebugContextRef?.updateLog && logId) {
    openaiDebugContextRef.updateLog(logId, update);
  }
}

// Create OpenAI client
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For development - should be moved to server in production
}) : null;

// Timeout wrapper
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Generate analysis using OpenAI Assistant API
 * @param {Object} payload - The form data payload
 * @param {Function} onStatusUpdate - Callback for status updates
 * @returns {Object} - { teaser, lead_temperature, email_user, email_sales }
 */
export async function generateAnalysis(payload, onStatusUpdate = () => {}) {
  if (!openai || !OPENAI_ASSISTANT_ID) {
    console.warn('OpenAI not configured, using fallback response');
    onStatusUpdate('generating', 'Génération des recommandations...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    onStatusUpdate('complete', 'Analyse terminée!');
    return generateFallbackResponse(payload);
  }

  try {
    onStatusUpdate('creating_thread', 'Création du fil de discussion...');

    // Log thread creation
    const threadLogId = addDebugLog(createLog('openai', 'threads.create', {
      endpoint: 'threads.create',
      method: 'POST',
      payload: null,
    }));

    const threadStartTime = Date.now();

    // Create thread with timeout
    const thread = await withTimeout(
      openai.beta.threads.create(),
      10000,
      'Thread creation timeout'
    );

    updateDebugLog(threadLogId, createLogUpdate(
      { data: { thread_id: thread.id } },
      Date.now() - threadStartTime,
      'success'
    ));
    
    onStatusUpdate('sending_data', 'Envoi des données au conseiller IA...');

    // Log message creation
    const messageLogId = addDebugLog(createLog('openai', 'threads.messages.create', {
      endpoint: `threads/${thread.id}/messages`,
      method: 'POST',
      payload: {
        role: 'user',
        content_length: JSON.stringify(payload).length,
        payload_summary: {
          user: payload.user,
          score: payload.score,
          answer_count: Object.keys(payload.answers || {}).length,
        },
      },
    }));

    const messageStartTime = Date.now();

    // Send message with form data
    const message = await withTimeout(
      openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: JSON.stringify(payload, null, 2)
      }),
      10000,
      'Message creation timeout'
    );

    updateDebugLog(messageLogId, createLogUpdate(
      { data: { message_id: message.id } },
      Date.now() - messageStartTime,
      'success'
    ));
    
    onStatusUpdate('analyzing', 'Analyse de vos réponses en cours...');

    // Log run creation
    const runLogId = addDebugLog(createLog('openai', 'threads.runs.create', {
      endpoint: `threads/${thread.id}/runs`,
      method: 'POST',
      payload: {
        assistant_id: OPENAI_ASSISTANT_ID,
      },
    }));

    const runStartTime = Date.now();

    // Create run (don't use createAndPoll as it can hang)
    const run = await withTimeout(
      openai.beta.threads.runs.create(thread.id, {
        assistant_id: OPENAI_ASSISTANT_ID
      }),
      10000,
      'Run creation timeout'
    );

    updateDebugLog(runLogId, createLogUpdate(
      { data: { run_id: run.id, status: run.status } },
      Date.now() - runStartTime,
      'success'
    ));
    
    // Poll for completion with timeout
    let runStatus = run;
    const startTime = Date.now();
    const maxWaitTime = 45000; // 45 seconds max
    let pollCount = 0;

    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Analysis timeout - taking too long');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      pollCount++;

      // Log status check
      const pollLogId = addDebugLog(createLog('openai', 'threads.runs.retrieve', {
        endpoint: `threads/${thread.id}/runs/${run.id}`,
        method: 'GET',
        payload: { poll_number: pollCount },
      }));

      const pollStartTime = Date.now();

      runStatus = await withTimeout(
        openai.beta.threads.runs.retrieve(thread.id, run.id),
        10000,
        'Status check timeout'
      );

      updateDebugLog(pollLogId, createLogUpdate(
        { data: { status: runStatus.status, poll_number: pollCount } },
        Date.now() - pollStartTime,
        'success'
      ));

      console.log('Run status:', runStatus.status);
    }
    
    if (runStatus.status !== 'completed') {
      console.error('Run failed with status:', runStatus.status);
      throw new Error(`Assistant run failed: ${runStatus.status}`);
    }
    
    onStatusUpdate('generating', 'Génération des recommandations...');

    // Log messages retrieval
    const messagesLogId = addDebugLog(createLog('openai', 'threads.messages.list', {
      endpoint: `threads/${thread.id}/messages`,
      method: 'GET',
      payload: null,
    }));

    const messagesStartTime = Date.now();

    // Get response
    const messages = await withTimeout(
      openai.beta.threads.messages.list(thread.id),
      10000,
      'Messages fetch timeout'
    );

    const assistantMessage = messages.data.find(m => m.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      updateDebugLog(messagesLogId, createLogUpdate(
        { error: 'No response from assistant' },
        Date.now() - messagesStartTime,
        'error'
      ));
      throw new Error('No response from assistant');
    }

    const responseText = assistantMessage.content[0].text.value;

    updateDebugLog(messagesLogId, createLogUpdate(
      { data: { message_count: messages.data.length } },
      Date.now() - messagesStartTime,
      'success'
    ));
    
    // Try to parse as JSON
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      const response = JSON.parse(jsonStr);

      // Log the final OpenAI response (HIGHLIGHTED)
      const responseLogId = addDebugLog(createLog('openai', 'assistant.response.complete', {
        endpoint: 'assistant_response',
        method: 'RESULT',
        payload: {
          raw_text_length: responseText.length,
          parsed_successfully: true,
        },
        isHighlighted: true,
        highlightReason: 'openai_response',
      }));

      updateDebugLog(responseLogId, createLogUpdate(
        {
          data: {
            teaser: response.teaser || response.summary || null,
            lead_temperature: response.lead_temperature || null,
            email_user: response.email_user || null,
            email_sales: response.email_sales || null,
            full_response: response,
          },
        },
        0,
        'success'
      ));

      onStatusUpdate('complete', 'Analyse terminée!');

      return {
        teaser: response.teaser || response.summary || generateDefaultTeaser(payload),
        lead_temperature: response.lead_temperature || classifyLead(payload.score.level),
        email_user: response.email_user || null,
        email_sales: response.email_sales || null,
      };
    } catch (parseError) {
      // If JSON parsing fails, use the raw text as teaser
      console.warn('Failed to parse assistant response as JSON:', parseError);

      // Log the parsing error with raw response
      const parseErrorLogId = addDebugLog(createLog('openai', 'assistant.response.parse_failed', {
        endpoint: 'assistant_response',
        method: 'RESULT',
        payload: {
          raw_text_length: responseText?.length || 0,
          parsed_successfully: false,
          error: parseError.message,
        },
        isHighlighted: true,
        highlightReason: 'openai_response',
      }));

      updateDebugLog(parseErrorLogId, createLogUpdate(
        {
          data: {
            raw_text: responseText?.substring(0, 500) || null,
            error: parseError.message,
          },
        },
        0,
        'error'
      ));

      onStatusUpdate('complete', 'Analyse terminée!');

      return {
        teaser: responseText.substring(0, 800),
        lead_temperature: classifyLead(payload.score.level),
        email_user: null,
        email_sales: null,
      };
    }
    
  } catch (error) {
    console.error('OpenAI API error:', error);

    // Log the error
    const errorLogId = addDebugLog(createLog('openai', 'assistant.error', {
      endpoint: 'assistant_api',
      method: 'ERROR',
      payload: null,
    }));

    updateDebugLog(errorLogId, createLogUpdate(
      {
        error: error.message,
        stack: error.stack,
      },
      0,
      'error'
    ));

    onStatusUpdate('generating', 'Génération des recommandations...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    onStatusUpdate('complete', 'Analyse terminée!');
    return generateFallbackResponse(payload);
  }
}

/**
 * Generate fallback response when OpenAI is not available
 */
function generateFallbackResponse(payload) {
  const { score, user } = payload;
  
  const teasers = {
    green: `Bravo ${user.first_name}! Votre organisation ${user.company} obtient un score de ${score.normalized}/10, ce qui indique une bonne maîtrise des exigences nLPD. Quelques ajustements mineurs pourraient renforcer encore votre conformité. Consultez votre email pour un rapport détaillé avec des recommandations personnalisées.`,
    orange: `${user.first_name}, votre organisation ${user.company} obtient un score de ${score.normalized}/10. Des lacunes significatives ont été identifiées dans votre conformité nLPD. Sans action corrective, vous pourriez être exposé en cas d'audit du PFPDT ou d'incident de sécurité. Consultez votre email pour découvrir vos 3 priorités d'action.`,
    red: `Attention ${user.first_name}! Votre organisation ${user.company} présente un score de ${score.normalized}/10, révélant des failles critiques dans votre conformité nLPD. Un audit du PFPDT pourrait entraîner des sanctions allant jusqu'à CHF 250'000. Une mise en conformité urgente est recommandée. Consultez votre email pour un plan d'action prioritaire.`,
  };
  
  return {
    teaser: teasers[score.level] || teasers.orange,
    lead_temperature: classifyLead(score.level),
    email_user: null,
    email_sales: null,
  };
}

/**
 * Generate default teaser based on score
 */
function generateDefaultTeaser(payload) {
  return generateFallbackResponse(payload).teaser;
}

/**
 * Classify lead temperature based on risk level
 */
function classifyLead(riskLevel) {
  const mapping = {
    red: 'HOT',
    orange: 'WARM',
    green: 'COLD',
  };
  return mapping[riskLevel] || 'WARM';
}

export default { generateAnalysis };
