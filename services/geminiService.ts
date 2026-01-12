import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, HumanizeConfig, GhostwriterConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Using stable gemini-pro model (available globally)
const ANALYSIS_MODEL = "gemini-pro";
// Use pro for rewriting
const HUMANIZE_MODEL = "gemini-pro";

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
    `;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        // Optimized: Temperature increased for more nuanced analysis
        temperature: 0.3, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiScore: {
              type: Type.NUMBER,
              description: "Probabilidad de 0 a 100 de que sea IA. Sé conservador.",
            },
            confidence: {
              type: Type.STRING,
              description: "Nivel de confianza: 'low', 'medium', o 'high'.",
              enum: ["low", "medium", "high"]
            },
            verdict: {
              type: Type.STRING,
              description: "Un veredicto corto (ej: 'Probablemente IA', 'Parece Humano').",
            },
            reasoning: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3-5 razones breves y específicas.",
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
            },
            metrics: {
              type: Type.OBJECT,
              description: "Métricas cuantitativas del texto.",
              properties: {
                avgSentenceLength: { type: Type.NUMBER },
                sentenceLengthVariation: { type: Type.NUMBER },
                uniqueWordRatio: { type: Type.NUMBER },
                formalConnectorCount: { type: Type.NUMBER },
                passiveVoiceRatio: { type: Type.NUMBER },
                hedgingPhraseCount: { type: Type.NUMBER }
              }
            },
            breakdown: {
              type: Type.OBJECT,
              description: "Desglose granular de scores por categoría (0-100).",
              properties: {
                linguistic: { type: Type.NUMBER, description: "Patrones lingüísticos" },
                structure: { type: Type.NUMBER, description: "Organización" },
                vocabulary: { type: Type.NUMBER, description: "Vocabulario y estilo" },
                content: { type: Type.NUMBER, description: "Profundidad del contenido" }
              }
            },
            detectedModel: {
              type: Type.STRING,
              description: "Modelo de IA detectado si es identificable: 'GPT', 'Claude', 'Gemini', 'Unknown', o 'None' si parece humano."
            }
          },
          required: ["aiScore", "confidence", "verdict", "reasoning", "highlightedSegments"],
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

      TÉCNICAS ANTI-DETECCIÓN OBLIGATORIAS:
      
      1. 🚫 PALABRAS PROHIBIDAS: Si usas alguna de estas, FALLARÁS: ${forbiddenWords.slice(0, 30).join(", ")}...
      
      2. 🌊 PERPLEJIDAD Y BURSTINESS (Variabilidad Extrema): 
         - Alterna frases CORTAS (3-7 palabras) con frases LARGAS (20-30 palabras)
         - Rompe la estructura predecible de sujeto-verbo-predicado
         - Varía la longitud de párrafos (algunos de 2 líneas, otros de 6)
      
      3. � VARIACIÓN SINTÁCTICA:
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
        temperature: 1.2, // Increased from 1.0 for more creativity and variation
        topP: 0.95,
        topK: 60, // Increased from 40 for more vocabulary variety
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