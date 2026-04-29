import { streamText, convertToModelMessages } from 'ai';
import { createGroq } from '@ai-sdk/groq'; // GoogleからGroqに変更
import { supabase } from '@/lib/supabase';

// Groqの初期化
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
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
      // モデルを Groq の高性能モデルに変更
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    // streamText の戻り値をレスポンスとして返却
    return result.toUIMessageStreamResponse();
  } catch (error: unknown) { // anyからunknownに変更（デプロイエラー対策）
    console.error('Error generating AI response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}