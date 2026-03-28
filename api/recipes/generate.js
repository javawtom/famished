export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' })
  }

  const { ingredients, mealType, preferences } = req.body

  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: 'No ingredients provided' })
  }

  const prompt = `You are a nutritionist and chef helping someone who is trying to gain weight healthily.

Given these ingredients they have at home:
${ingredients.map(i => `- ${i.name}${i.expiresIn ? ` (use within ${i.expiresIn} days)` : ''}`).join('\n')}

${mealType ? `They want a ${mealType} recipe.` : 'Suggest the best meal type.'}
${preferences ? `Preferences: ${preferences}` : ''}

Rules:
- Prioritize ingredients expiring soon
- Focus on calorie-dense, nutritious meals for healthy weight gain
- Keep recipes simple (under 30 min prep)
- Include estimated calories per serving

Return EXACTLY this JSON format (no markdown, no code blocks):
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "One sentence description",
      "mealType": "breakfast|lunch|dinner|snack",
      "prepTime": "15 min",
      "calories": 650,
      "ingredients": ["ingredient 1 with amount", "ingredient 2"],
      "steps": ["Step 1 instruction", "Step 2 instruction"],
      "usesExpiring": ["ingredient name if expiring soon"]
    }
  ]
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: 'Gemini API error', details: err })
    }

    const data = await response.json()
    // Gemini 2.5 thinking models return multiple parts (thought + text)
    const parts = data.candidates?.[0]?.content?.parts || []
    const rawText = parts.map(p => p.text || '').join('')

    const firstBrace = rawText.indexOf('{')
    const lastBrace = rawText.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({ error: 'No JSON found in AI response' })
    }
    const jsonStr = rawText.slice(firstBrace, lastBrace + 1)
    const parsed = JSON.parse(jsonStr)

    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate recipes', message: err.message })
  }
}
