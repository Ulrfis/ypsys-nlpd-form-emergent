import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;

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
    
    // Create thread with timeout
    const thread = await withTimeout(
      openai.beta.threads.create(),
      10000,
      'Thread creation timeout'
    );
    
    onStatusUpdate('sending_data', 'Envoi des données au conseiller IA...');
    
    // Send message with form data
    await withTimeout(
      openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: JSON.stringify(payload, null, 2)
      }),
      10000,
      'Message creation timeout'
    );
    
    onStatusUpdate('analyzing', 'Analyse de vos réponses en cours...');
    
    // Create run (don't use createAndPoll as it can hang)
    const run = await withTimeout(
      openai.beta.threads.runs.create(thread.id, {
        assistant_id: OPENAI_ASSISTANT_ID
      }),
      10000,
      'Run creation timeout'
    );
    
    // Poll for completion with timeout
    let runStatus = run;
    const startTime = Date.now();
    const maxWaitTime = 45000; // 45 seconds max
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Analysis timeout - taking too long');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      runStatus = await withTimeout(
        openai.beta.threads.runs.retrieve(thread.id, run.id),
        10000,
        'Status check timeout'
      );
      
      console.log('Run status:', runStatus.status);
    }
    
    if (runStatus.status !== 'completed') {
      console.error('Run failed with status:', runStatus.status);
      throw new Error(`Assistant run failed: ${runStatus.status}`);
    }
    
    onStatusUpdate('generating', 'Génération des recommandations...');
    
    // Get response
    const messages = await withTimeout(
      openai.beta.threads.messages.list(thread.id),
      10000,
      'Messages fetch timeout'
    );
    
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      throw new Error('No response from assistant');
    }
    
    const responseText = assistantMessage.content[0].text.value;
    
    // Try to parse as JSON
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      const response = JSON.parse(jsonStr);
      
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
