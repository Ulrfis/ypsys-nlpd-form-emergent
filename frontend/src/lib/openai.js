import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;

// Create OpenAI client
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For development - should be moved to server in production
}) : null;

/**
 * Generate analysis using OpenAI Assistant API
 * @param {Object} payload - The form data payload
 * @param {Function} onStatusUpdate - Callback for status updates
 * @returns {Object} - { teaser, lead_temperature, email_user, email_sales }
 */
export async function generateAnalysis(payload, onStatusUpdate = () => {}) {
  if (!openai || !OPENAI_ASSISTANT_ID) {
    console.warn('OpenAI not configured, using fallback response');
    return generateFallbackResponse(payload);
  }

  try {
    onStatusUpdate('creating_thread', 'Création du fil de discussion...');
    
    // Create thread
    const thread = await openai.beta.threads.create();
    
    onStatusUpdate('sending_data', 'Envoi des données au conseiller IA...');
    
    // Send message with form data
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: JSON.stringify(payload, null, 2)
    });
    
    onStatusUpdate('analyzing', 'Analyse de vos réponses en cours...');
    
    // Run assistant and poll for completion
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: OPENAI_ASSISTANT_ID
    });
    
    if (run.status !== 'completed') {
      console.error('Run failed with status:', run.status);
      throw new Error(`Assistant run failed: ${run.status}`);
    }
    
    onStatusUpdate('generating', 'Génération des recommandations...');
    
    // Get response
    const messages = await openai.beta.threads.messages.list(thread.id);
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
        teaser: responseText.substring(0, 500),
        lead_temperature: classifyLead(payload.score.level),
        email_user: null,
        email_sales: null,
      };
    }
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    onStatusUpdate('error', 'Utilisation du mode hors-ligne...');
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
