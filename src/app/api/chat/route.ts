import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { supabase } from '@/lib/supabase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 直近のトレーニング記録を30件取得
  const { data: setsData } = await supabase
    .from('sets')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false }) // 同じ日の場合は作成順に降順
    .limit(30);

  let context = '最近のトレーニング記録はありません。';
  if (setsData && setsData.length > 0) {
    context = setsData.map(set => {
      return `${set.date} - ${set.exercise}: ${set.weight}kg x ${set.reps}回 (${set.status})`;
    }).join('\n');
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

  try {
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
