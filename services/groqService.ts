import Groq from "groq-sdk";
import { AnalysisResult, HumanizeConfig, GhostwriterConfig } from "../types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Using Llama 3.3 70B (robust model with 280 tokens/sec and 131K context)
const ANALYSIS_MODEL = "llama-3.3-70b-versatile";
const HUMANIZE_MODEL = "llama-3.3-70b-versatile";

export const analyzeTextForAI = async (text: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Actúa como un detector de IA de última generación entrenado en 2025. Conoces los patrones de GPT-4, Claude, Gemini y otros modelos modernos.

      **PRINCIPIO DE INOCENCIA:**
      Asume que el texto es HUMANO a menos que haya evidencia abrumadora de patrones artificiales.
      Si el texto tiene errores, inconsistencias, humor, opiniones fuertes, o estructura desordenada, probablemente ES HUMANO.

      **SEÑALES AVANZADAS DE IA (Analiza TODAS estas categorías):**

      1. **PATRONES LINGÜÍSTICOS:**
         - Longitud de oraciones demasiado uniforme (todas entre 15-25 palabras)
         - Uso excesivo de voz pasiva sin razón estilística
         - Falta de contracciones naturales en contextos casuales
         - Vocabulario "de diccionario" poco común en conversación real

      2. **ESTRUCTURA Y ORGANIZACIÓN:**
         - Listas numeradas perfectamente simétricas
         - Párrafos de longitud casi idéntica
         - Transiciones mecánicas entre párrafos
         - Estructura de espejo: párrafos que empiezan y terminan igual

      3. **VOCABULARIO Y ESTILO:**
         - Palabras prohibidas: "cabe destacar", "es importante mencionar", "meticuloso", "integral", "paradigma"
         - Evita pronombres personales de forma antinatural
         - Uso excesivo de sinónimos forzados
         - Adjetivos genéricos: "robusto", "versátil", "innovador"

      4. **CONTENIDO Y PROFUNDIDAD:**
         - Información genérica sin ejemplos específicos
         - Falta de anécdotas o experiencias personales
         - Respuestas "equilibradas" artificialmente
         - Evita tomar posturas claras

      5. **MARCADORES TEMPORALES:**
         - Frases vagas: "en los últimos años", "recientemente"
         - Falta de referencias específicas a fechas/eventos
         - Intros genéricas: "En este artículo"

      6. **PERFECCIÓN SOSPECHOSA:**
         - Gramática impecable pero sin personalidad
         - Cero errores tipográficos
         - Puntuación perfecta sin variación

      7. **DETECCIÓN DE HEDGING EXCESIVO:**
         - Uso excesivo de: "puede ser", "podría", "tal vez", "posiblemente"
         - Frases que evitan comprometerse: "generalmente", "típicamente", "en cierta medida"
         - Calificadores innecesarios: "relativamente", "bastante", "algo"

      8. **FIRMAS ESPECÍFICAS DE MODELOS IA:**
         - GPT: "It's worth noting", "It's important to", estructuras muy balanceadas
         - Claude: "I'd be happy to", "I appreciate", tono excesivamente cortés
         - Gemini: Listas muy organizadas, explicaciones paso a paso mecánicas

      9. **COHERENCIA CONTEXTUAL:**
         - ¿Tiene referencias cruzadas coherentes?
         - ¿Progresión lógica natural o forzada?
         - ¿Ejemplos específicos y concretos o genéricos?
         - ¿Hay contradicciones sutiles?

      INSTRUCCIONES DE PROCESAMIENTO HTML:
      El texto puede contener HTML (<div>, <b>, <li>, <br>).
      1. IGNORA las etiquetas para el análisis
      2. ANALIZA solo el contenido textual

      **ANÁLISIS CUANTITATIVO REQUERIDO:**
      Además del análisis cualitativo, calcula:
      - Longitud promedio de oraciones
      - Variación de longitud (desviación estándar)
      - Ratio de palabras únicas
      - Conteo de conectores formales
      - Ratio de voz pasiva
      - Conteo de frases de hedging

      **SCORING GRANULAR:**
      Proporciona scores separados (0-100) para:
      - Patrones lingüísticos
      - Estructura y organización
      - Vocabulario y estilo
      - Contenido y profundidad

      **NIVEL DE CONFIANZA:**
      Indica tu nivel de confianza:
      - LOW: Señales ambiguas, podría ser humano o IA
      - MEDIUM: Algunas señales claras pero no concluyentes
      - HIGH: Evidencia abrumadora en una dirección

      **IMPORTANTE:** Sé conservador con el score. Un texto con 2-3 señales leves = 20-40%. Solo da 70%+ si hay evidencia abrumadora.

      Texto a analizar:
      "${text}"

      DEVUELVE UN JSON VÁLIDO con esta estructura exacta:
      {
        "aiScore": number (0-100),
        "confidence": "low" | "medium" | "high",
        "verdict": "string breve",
        "reasoning": ["razón 1", "razón 2", "razón 3"],
        "highlightedSegments": [{"text": "fragmento", "explanation": "por qué"}],
        "metrics": {
          "avgSentenceLength": number,
          "sentenceLengthVariation": number,
          "uniqueWordRatio": number,
          "formalConnectorCount": number,
          "passiveVoiceRatio": number,
          "hedgingPhraseCount": number
        },
        "breakdown": {
          "linguistic": number,
          "structure": number,
          "vocabulary": number,
          "content": number
        },
        "detectedModel": "GPT" | "Claude" | "Gemini" | "Unknown" | "None"
      }
    `;

    const response = await groq.chat.completions.create({
      model: ANALYSIS_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un detector de IA avanzado entrenado en 2025. Devuelve SOLO JSON válido sin markdown ni explicaciones."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return result as AnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing text with Groq:", error);
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

    // EXPANDED: 50+ palabras y frases que delatan IA
    const forbiddenWords = [
      // Conectores robóticos
      "cabe destacar", "es importante mencionar", "es importante señalar", "es fundamental destacar",
      "en conclusión", "por otro lado", "asimismo", "adicionalmente", "en resumen",
      "no obstante", "sin embargo", "por consiguiente", "en consecuencia", "de igual manera",
      "por ende", "en este sentido", "a su vez", "en primer lugar", "en segundo lugar",

      // Adjetivos de IA
      "meticuloso", "integral", "exhaustivo", "robusto", "versátil",
      "innovador", "revolucionario", "transformador", "disruptivo", "vanguardista",
      "holístico", "dinámico", "estratégico", "óptimo", "eficiente",
      "sofisticado", "avanzado", "complejo", "multifacético",

      // Verbos formales excesivos
      "ahondar", "profundizar", "implementar", "optimizar", "potenciar",
      "maximizar", "facilitar", "posibilitar", "viabilizar", "materializar",
      "consolidar", "fortalecer", "robustecer",

      // Frases de marketing IA
      "sumérgete en", "libera tu potencial", "cambiará el juego", "revolucionará",
      "panorama actual", "en el mundo de hoy", "en la era digital", "en el contexto actual",
      "descubre cómo", "aprende a", "domina el arte de", "desbloquea el poder de",
      "lleva tu", "al siguiente nivel", "transforma tu",

      // Sustantivos abstractos genéricos
      "paradigma", "sinergia", "contexto", "ámbito", "entorno", "escenario",
      "perspectiva", "enfoque", "metodología", "marco", "ecosistema", "panorama",

      // Frases introductorias típicas de IA
      "en este artículo", "a lo largo de este texto", "en las siguientes líneas",
      "vale la pena mencionar", "conviene señalar", "resulta importante"
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

    if (previousAnalysis && previousAnalysis.aiScore < 20) {
      // MODO PRESERVACIÓN (Evita que el humanizador arruine un buen texto)
      strategyPrompt = `
      🛡️ MODO PULIDO LIGERO (El texto ya parece muy humano - score < 20%):
      1. NO REESCRIBAS TODO. El usuario solo quiere correcciones menores.
      2. Mantén el 90% del texto original.
      3. Solo cambia palabras muy formales por sinónimos más simples.
      4. Aplica las reglas de "Lenguaje Sencillo" pero mantén la estructura.
      `;
    } else {
      // MODO ATAQUE AGRESIVO (El texto es muy robótico)
      strategyPrompt = `
      🔥 MODO ANTI-DETECCIÓN EXTREMA (El texto tiene score de IA ${previousAnalysis?.aiScore || 50}%):

      ⚠️ OBJETIVO CRÍTICO: Reducir el score de detección de IA a MENOS del 25%.

      TU MISIÓN: Reescribir el texto para que suene 100% humano, eliminando TODOS los patrones de IA.

      ${humanStyleRules}

      TÉCNICAS ANTI-DETECCIÓN OBLIGATORIAS (APLICA TODAS):

      1. 🚫 PALABRAS PROHIBIDAS: Si usas alguna de estas, FALLARÁS: ${forbiddenWords.slice(0, 30).join(", ")}...

      2. 🌊 PERPLEJIDAD Y BURSTINESS (Variabilidad Extrema):
         - Alterna frases CORTAS (3-7 palabras) con frases LARGAS (20-30 palabras)
         - Rompe la estructura predecible de sujeto-verbo-predicado
         - Varía la longitud de párrafos (algunos de 2 líneas, otros de 6)

      3. 🎯 VARIACIÓN SINTÁCTICA:
         - Reordena cláusulas (subordinadas antes/después)
         - Alterna voz activa/pasiva estratégicamente
         - Usa inversión de sujeto ocasionalmente

      4. 🗣️ INYECCIÓN DE HUMANIDAD:
         - Añade marcadores de duda: "creo", "quizás", "probablemente"
         - ${!isAcademic ? 'Usa paréntesis para pensamientos laterales' : 'Incluye ejemplos concretos (no genéricos)'}
         - Muestra opinión o perspectiva personal

      5. 🎯 NATURALIZACIÓN DE VOCABULARIO:
         - Reemplaza palabras "de diccionario" por coloquiales
         - ${!isAcademic ? 'Usa contracciones cuando sea apropiado' : 'Prefiere palabras cortas sobre largas'}
         - Evita sinónimos forzados, repite palabras si es natural

      6. ✨ IMPERFECCIONES CONTROLADAS:
         - ${!isAcademic ? 'Permite redundancias ocasionales (humanos repiten ideas)' : 'Varía conectores, no uses siempre los mismos'}
         - ${!isAcademic ? 'Usa conectores informales: "bueno", "entonces", "así que"' : 'Rompe reglas gramaticales menores si suena más natural'}
         - Elimina intros genéricas, ve directo al punto

      7. 🎭 REESCRITURA RADICAL:
         - NO te limites a cambiar palabras. REESCRIBE oraciones completas.
         - Cambia el ORDEN de las ideas si es necesario.
         - Usa SINÓNIMOS genuinos, no solo palabras más cortas.
         - Agrega detalles específicos o ejemplos concretos cuando sea apropiado.
         - Elimina frases que suenen corporativas o académicas en exceso.

      8. 🔍 AUTO-VERIFICACIÓN:
         - Después de reescribir, LEE el resultado.
         - Pregúntate: "¿Esto suena como lo escribiría una persona normal?"
         - Si detectas patrones repetitivos o formales, REESCRIBE de nuevo.
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

      SOLO DEVUELVE EL TEXTO REESCRITO EN HTML VÁLIDO. NO agregues explicaciones ni markdown.
    `;

    const response = await groq.chat.completions.create({
      model: HUMANIZE_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un experto en humanización de textos. Devuelve SOLO HTML válido, sin markdown ni explicaciones."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 1.2,
      top_p: 0.95,
      max_tokens: 2048
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Error humanizing text with Groq:", error);
    const msg = (error.message || error.toString()).toLowerCase();

    if (msg.includes("api key") || msg.includes("401")) {
      throw new Error("⛔ Error de Autenticación: Tu API Key de Groq es inválida.");
    }
    if (msg.includes("quota") || msg.includes("429")) {
      throw new Error("⏳ Cuota Excedida: Intenta de nuevo en unos segundos.");
    }

    throw new Error(`Error al Humanizar: ${error.message}`);
  }
};
