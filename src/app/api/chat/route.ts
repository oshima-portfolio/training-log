import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { supabase } from '@/lib/supabase';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  // baseURLは消した状態でOKです！
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let context = '最近のトレーニング記録はありません。';
    const { data: setsData, error: dbError } = await supabase
      .from('sets')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (!dbError && setsData) {
      context = setsData.map(set => `${set.date} - ${set.exercise}: ${set.weight}kg x ${set.reps}回 (${set.status})`).join('\n');
    }

    const systemPrompt = `あなたは、プロのパーソナルトレーナーであり、親しみやすく、かつ専門的なAIコーチです。
ユーザーの最近のトレーニング記録を踏まえて、アドバイスや質問への回答を行ってください。

【ユーザーの最近のトレーニング記録】
${context}

これらを踏まえて、以下を意識して回答してください：
1. トレーニングの頑張りをポジティブに励ます。
2. フォームや重量アップのアドバイスを提供する。
3. 専門用語は分かりやすく解説する。
4. 回答は簡潔に、読みやすいフォーマット（マークダウン）を使用する。`;

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}