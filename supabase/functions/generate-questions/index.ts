import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, requirements, behavioral_criteria } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não configurada nos secrets do Supabase.");
    }

    const prompt = `Você é um especialista em recrutamento e seleção. Gere 5 perguntas objetivas para o formulário de candidatura da vaga abaixo.

Vaga: ${title}
Descrição: ${description}
Requisitos técnicos: ${requirements}
Critérios comportamentais: ${behavioral_criteria}

Regras:
- As perguntas devem ser diretas e fáceis de responder por escrito
- Misture perguntas técnicas e comportamentais
- Não use numeração nas perguntas
- Retorne apenas as perguntas, uma por linha, sem explicações ou comentários adicionais`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Erro na API Anthropic: ${err}`);
    }

    const data = await response.json();
    const text = data.content[0].text as string;
    const questions = text
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
