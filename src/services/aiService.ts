/**
 * AI Service
 * Handles OpenAI API calls for task prioritization
 */

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface TaskForPrioritization {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface PrioritizationResult {
  success: boolean;
  orderedTaskIds: string[];
  error?: string;
}

/**
 * Prioritize tasks using OpenAI GPT
 * Returns an ordered array of task IDs based on AI-determined priority
 */
export async function prioritizeTasks(
  tasks: TaskForPrioritization[]
): Promise<PrioritizationResult> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    return {
      success: false,
      orderedTaskIds: [],
      error: 'OpenAI API key not configured. Please add your API key to the .env file.',
    };
  }

  if (tasks.length === 0) {
    return {
      success: true,
      orderedTaskIds: [],
    };
  }

  // Only prioritize pending tasks
  const pendingTasks = tasks.filter(t => !t.completed);

  if (pendingTasks.length === 0) {
    return {
      success: true,
      orderedTaskIds: [],
    };
  }

  const taskList = pendingTasks
    .map(
      (task, index) =>
        `${index + 1}. [ID: ${task.id}] Title: "${task.title}"${task.description ? `, Description: "${task.description}"` : ''}, Priority: ${task.priority}`
    )
    .join('\n');

  const prompt = `You are a productivity assistant helping prioritize daily tasks. Analyze the following tasks and return them in order of urgency/importance.

PRIORITIZATION CRITERIA (in order of importance):

1. EMERGENCIES & CRITICAL NEEDS (highest priority):
   - Health/medical issues (doctor appointments, medication, symptoms)
   - Safety concerns (car repairs, home repairs, security)
   - Financial urgencies (bills due, rent, overdrafts, debt)
   - Family emergencies or critical family needs
   - Legal deadlines or court dates

2. TIME-SENSITIVE TASKS:
   - Tasks with specific deadlines (today, tomorrow, this week)
   - Scheduled appointments, meetings, exams
   - Events that cannot be rescheduled
   - Tasks that block other people's work

3. IMPORTANT DAILY RESPONSIBILITIES:
   - Work/school deliverables with deadlines
   - Essential errands (groceries if out of food, gas if tank empty)
   - Childcare or dependent care tasks
   - Tasks marked as "high" priority by the user

4. DEPENDENCIES & BLOCKERS:
   - Tasks that must be done before other tasks
   - Tasks that enable other people to proceed
   - Preparation tasks for upcoming events

5. QUICK WINS & MOMENTUM:
   - Simple tasks that take <15 minutes
   - Tasks that reduce stress or clear mental load
   - Tasks that prevent bigger problems later

6. ROUTINE & MAINTENANCE:
   - Regular chores and maintenance
   - Self-care and wellness tasks
   - Tasks marked as "medium" or "low" priority

CONTEXT AWARENESS:
- Recognize implicit urgency (e.g., "running out of" = urgent)
- Consider real-world consequences of delay
- Balance urgency with importance
- Prioritize tasks that prevent emergencies over tasks that are just deadlines

Tasks:
${taskList}

Return ONLY a JSON array of task IDs in the recommended order (most urgent first). Example format: ["id1", "id2", "id3"]
Do not include any explanation, just the JSON array.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an intelligent task prioritization assistant with deep understanding of real-world urgency and daily life context. You recognize emergencies, health issues, financial urgencies, and time-sensitive matters. You understand implicit urgency (e.g., "running out of medicine" is critical, "buy groceries" depends on context). Always respond with only a JSON array of task IDs in priority order.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return {
        success: false,
        orderedTaskIds: [],
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        orderedTaskIds: [],
        error: 'No response from AI',
      };
    }

    // Parse the JSON array from the response
    let orderedIds: string[];
    try {
      // Handle potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      orderedIds = JSON.parse(cleanContent);

      if (!Array.isArray(orderedIds)) {
        throw new Error('Response is not an array');
      }

      // Validate that all IDs are from the original task list
      const validIds = pendingTasks.map(t => t.id);
      orderedIds = orderedIds.filter(id => validIds.includes(id));

      // Add any missing IDs at the end (in case AI missed some)
      const missingIds = validIds.filter(id => !orderedIds.includes(id));
      orderedIds = [...orderedIds, ...missingIds];
    } catch {
      console.error('Failed to parse AI response:', content);
      return {
        success: false,
        orderedTaskIds: [],
        error: 'Failed to parse AI response',
      };
    }

    return {
      success: true,
      orderedTaskIds: orderedIds,
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      success: false,
      orderedTaskIds: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
