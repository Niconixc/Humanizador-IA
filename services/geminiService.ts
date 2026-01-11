import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, HumanizeConfig, GhostwriterConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Changed from Flash to Pro for higher accuracy in detection
const ANALYSIS_MODEL = "gemini-3-pro-preview";
// Use Pro for high-quality rewriting
const HUMANIZE_MODEL = "gemini-3-pro-preview";

export const analyzeTextForAI = async (text: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Actúa como un lingüista forense escéptico. Tu tarea es analizar el siguiente texto para determinar si fue escrito por una IA o un humano.
      
      **PRINCIPIO DE INOCENCIA:** 
      Debes asumir que el texto es HUMANO a menos que haya evidencia abrumadora de patrones artificiales. 
      Si el texto tiene errores gramaticales, inconsistencias lógicas, humor sutil, o una estructura desordenada, ES HUMANO.
      
      **SEÑALES REALES DE IA (Solo marca si son evidentes):**
      1. **Perfección Plana:** Gramática impecable pero aburrida.
      2. **Conectores Mecánicos:** Uso excesivo de "Por lo tanto", "En conclusión", "Cabe destacar", "Es importante señalar".
      3. **Estructura de Espejo:** Párrafos que empiezan y terminan de forma idéntica o listas muy simétricas.
      4. **Falta de Opinión:** El texto evita tomar posturas claras o usa "algunos dicen que...".

      INSTRUCCIONES DE PROCESAMIENTO HTML:
      El texto de entrada puede contener etiquetas HTML (ej: <div>, <b>, <li>, <br>).
      1. IGNORA las etiquetas para el análisis de estilo (no critiques el HTML).
      2. ANALIZA solo el contenido textual legible por humanos dentro de las etiquetas.
      
      Texto a analizar:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        // CRITICAL: Temperature very low for deterministic results. 
        temperature: 0.1, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiScore: {
              type: Type.NUMBER,
              description: "Probabilidad de 0 a 100 de que sea IA. Sé conservador.",
            },
            verdict: {
              type: Type.STRING,
              description: "Un veredicto corto (ej: 'Probablemente IA', 'Parece Humano').",
            },
            reasoning: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 razones breves.",
            },
            highlightedSegments: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "El fragmento exacto del texto original." },
                  explanation: { type: Type.STRING, description: "Por qué parece IA." }
                },
                required: ["text", "explanation"]
              },
              description: "Fragmentos específicos robóticos.",
            }
          },
          required: ["aiScore", "verdict", "reasoning", "highlightedSegments"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing text:", error);
    const msg = error.message || error.toString();
    throw new Error(`Error en Análisis: ${msg}`);
  }
};

export const humanizeText = async (
  text: string, 
  config: HumanizeConfig, 
  previousAnalysis?: AnalysisResult | null,
  ghostwriter?: GhostwriterConfig
): Promise<string> => {
  try {
    
    const formatInstructions = `
      NOTA TÉCNICA CRÍTICA:
      El texto de entrada contiene HTML. DEBES DEVOLVER HTML VÁLIDO.
      1. MANTÉN <br> y <p>.
      2. MANTÉN negritas <b> si son títulos.
      3. NO uses Markdown.
    `;

    const forbiddenWords = [
      "cabe destacar", "es importante mencionar", "en conclusión", "por otro lado", 
      "asimismo", "adicionalmente", "en resumen", "meticuloso", "integral", 
      "ahondar", "contexto", "ámbito", "sinergia", "paradigma", "crucial", "fundamental",
      "sumérgete en", "libera tu potencial", "revolucionario", "cambiará el juego", "panorama actual"
    ];

    const isAcademic = config.tone === 'academic';

    // Nuevas reglas de estilo humano adaptadas al tono
    const humanStyleRules = `
      PRINCIPIOS DE ESCRITURA HUMANA:
      1. **Lenguaje Sencillo:** Usa oraciones claras. Evita la paja y los adjetivos de relleno ("vasto", "meticuloso").
      2. **Voz Humana Natural:**
         - Varía el ritmo: Mezcla oraciones cortas (golpes) con oraciones medianas. No seas monótono.
         - Evita frases cliché de IA: NADA de "Sumérgete en", "Descubre cómo", "En el mundo de hoy".
      
      ${!isAcademic ? `
      3. **Imperfecciones Deliberadas (SOLO PARA TONO CASUAL/CREATIVO):**
         - Usa contracciones naturales.
         - Está bien empezar frases con "Y", "Pero" o "Así que".
         - Transiciones casuales: Usa "La cosa es...", "De todas formas..." en lugar de conectores rígidos.
         - Muestra opinión: "Creo que", "Honestamente", "Supongo".
      ` : `
      3. **Claridad Académica (SOLO PARA TONO ACADÉMICO):**
         - Mantén la formalidad pero EVITA sonar pomposo.
         - Sé directo y conciso. La academia valora la claridad, no el vocabulario rebuscado.
         - Evita el lenguaje de marketing ("revolucionario", "transformador") incluso en contextos académicos.
      `}
    `;

    // Estrategia Dinámica basada en el puntaje anterior
    let strategyPrompt = "";
    
    if (previousAnalysis && previousAnalysis.aiScore < 30) {
      // MODO PRESERVACIÓN (Evita que el humanizador arruine un buen texto)
      strategyPrompt = `
      🛡️ MODO PULIDO LIGERO (El texto ya parece humano):
      1. NO REESCRIBAS TODO. El usuario solo quiere correcciones menores.
      2. Mantén el 90% del texto original.
      3. Solo cambia palabras muy formales por sinónimos más simples.
      4. Aplica las reglas de "Lenguaje Sencillo" pero mantén la estructura.
      `;
    } else {
      // MODO ATAQUE AGRESIVO (El texto es muy robótico)
      strategyPrompt = `
      🔥 MODO ANTI-DETECCIÓN EXTREMA (El texto es robótico/IA):
      
      TU OBJETIVO: Engañar a los detectores de IA y sonar como una persona real.
      
      ${humanStyleRules}

      TÁCTICAS OBLIGATORIAS:
      1. 🚫 PALABRAS PROHIBIDAS: Si usas alguna de estas, FALLARÁS: ${forbiddenWords.join(", ")}.
      2. 🌊 PERPLEJIDAD Y BURSTINESS (Variabilidad): 
         - Alterna frases extremadamente cortas con frases complejas.
         - Rompe la estructura predecible de sujeto-verbo-predicado.
      3. 🗣️ AUTENTICIDAD:
         - Elimina la "intro IA" típica (ej: "En el panorama digital actual..."). Ve al grano.
         - ${!isAcademic ? 'Usa paréntesis para pensamientos laterales o comentarios al margen.' : 'Usa estructuras de oraciones variadas.'}
      `;
    }

    let stylePrompt = `
      TONO CONFIGURADO: ${config.tone}
      NIVEL GRAMATICAL: ${config.grammarLevel}
    `;

    if (ghostwriter && ghostwriter.isEnabled && ghostwriter.referenceText) {
      stylePrompt = `
      👻 MODO GHOSTWRITER (CLONACIÓN DE ESTILO):
      
      INSTRUCCIÓN PRINCIPAL:
      Reescribe el contenido imitando el VOCABULARIO, LONGITUD DE FRASES y ACTITUD del siguiente texto de referencia.
      
      TEXTO DE REFERENCIA (Tu guía de estilo):
      "${ghostwriter.referenceText.substring(0, 2000)}..."

      Si el texto de referencia es informal, ignora las reglas académicas y sé totalmente coloquial.
      Mantén la estructura HTML (párrafos, negritas) del texto original a reescribir.
      `;
    }

    const prompt = `
      Reescribe el siguiente texto siguiendo estrictamente las instrucciones de estilo humano.

      ${stylePrompt}

      ${formatInstructions}

      ${strategyPrompt}

      TEXTO ORIGINAL A REESCRIBIR:
      "${text}"

      SOLO DEVUELVE EL TEXTO REESCRITO EN HTML VÁLIDO.
    `;

    const response = await ai.models.generateContent({
      model: HUMANIZE_MODEL,
      contents: prompt,
      config: {
        temperature: 1.0, // Alta creatividad para humanizar
        topP: 0.95,
        topK: 40,
      }
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Error humanizing text:", error);
    const msg = (error.message || error.toString()).toLowerCase();
    
    if (msg.includes("api key") || msg.includes("401")) {
      throw new Error("⛔ Error de Autenticación: Tu API Key es inválida.");
    }
    if (msg.includes("quota") || msg.includes("429")) {
      throw new Error("⏳ Cuota Excedida: Intenta de nuevo en unos segundos.");
    }
    
    throw new Error(`Error al Humanizar: ${error.message}`);
  }
};