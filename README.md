<div align="center">
<img width="1200" height="475" alt="Humanizador IA Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🤖➡️👤 Humanizador IA

**Transforma texto generado por IA en contenido 100% humano**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Groq Support](https://img.shields.io/badge/Groq-Llama%203.3-FF6B6B?style=for-the-badge)](https://groq.com/)

[Demo en Vivo](https://humanizador-ia.vercel.app) • [Reportar Bug](https://github.com/Niconixc/Humanizador-IA/issues) • [Solicitar Feature](https://github.com/Niconixc/Humanizador-IA/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Algoritmo Anti-Detección](#-algoritmo-anti-detección)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **🔍 Detector de IA Avanzado**

  - Análisis con 24+ criterios de detección
  - Métricas cuantitativas (perplejidad, burstiness, etc.)
  - Scoring granular por categorías
  - Detección de modelos específicos (GPT, Claude, Gemini)
  - Nivel de confianza en el veredicto

- **✍️ Humanizador Ultra-Potente**

  - Algoritmo anti-GPTZero con 10 técnicas avanzadas
  - 100+ palabras y frases prohibidas
  - Variación extrema de longitud de oraciones
  - Reescritura radical con cambio de orden de ideas
  - Objetivo: < 20% detección en GPTZero

- **🎨 Experiencia de Usuario Premium**

  - ⌨️ Atajos de teclado (Ctrl+Enter, Ctrl+D, Ctrl+K)
  - 💾 Auto-guardado cada 30 segundos
  - 🔔 Notificaciones Toast elegantes
  - 📊 Contador de palabras/caracteres en tiempo real
  - 💡 Tooltips informativos
  - 🌓 Modo oscuro/claro

- **⚡ Multi-Proveedor de IA**
  - Google Gemini 2.0 Flash (alta calidad)
  - Groq Llama 3.3 70B (ultra rápido)
  - Cambio dinámico entre proveedores
  - Configuración de API Keys personalizada

### 🎛️ Configuración Avanzada

- **3 Niveles Gramaticales**: Secundaria, Universitario, Doctorado
- **3 Tonos de Escritura**: Académico, Casual, Creativo
- **Modo Ghostwriter**: Clona el estilo de un texto de referencia
- **Historial Completo**: Guarda y restaura trabajos anteriores
- **Comparación de Textos**: Vista diff entre original y humanizado

---

## 🛠️ Tecnologías

### Frontend

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilos utility-first

### IA & APIs

- **Google Gemini 2.0 Flash** - Modelo principal
- **Groq Llama 3.3 70B** - Modelo alternativo
- **@google/genai** - SDK oficial de Gemini

### Librerías

- **lucide-react** - Iconos modernos
- **recharts** - Gráficos interactivos
- **diff** - Comparación de textos
- **mammoth** - Importación de archivos .docx

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **API Key de Gemini** ([Obtener gratis](https://aistudio.google.com/app/apikey))
- (Opcional) **API Key de Groq** ([Obtener gratis](https://console.groq.com/))

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Niconixc/Humanizador-IA.git
   cd Humanizador-IA
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env.local` en la raíz del proyecto:

   ```env
   VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui
   VITE_GROQ_API_KEY=tu_api_key_de_groq_aqui  # Opcional
   ```

4. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable              | Descripción              | Requerida |
| --------------------- | ------------------------ | --------- |
| `VITE_GEMINI_API_KEY` | API Key de Google Gemini | ✅ Sí     |
| `VITE_GROQ_API_KEY`   | API Key de Groq          | ❌ No     |

### Obtener API Keys

#### Google Gemini (Gratis)

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Haz clic en "Create API Key"
3. Selecciona un proyecto de Google Cloud
4. Copia la API Key generada

#### Groq (Gratis)

1. Ve a [Groq Console](https://console.groq.com/)
2. Crea una cuenta
3. Genera una API Key
4. Copia la API Key

### Configuración en la App

Una vez dentro de la aplicación:

1. Haz clic en el icono de **Ajustes** (⚙️)
2. Selecciona tu proveedor de IA preferido
3. Haz clic en el botón de configuración para añadir/editar API Keys
4. Guarda los cambios

---

## 📖 Uso

### Flujo Básico

1. **Pega o escribe** tu texto en el editor izquierdo
2. **Configura** el nivel gramatical y tono deseado
3. **Detectar IA**: Haz clic en "Detectar IA" o presiona `Ctrl+D`
4. **Humanizar**: Haz clic en "Humanizar" o presiona `Ctrl+Enter`
5. **Copiar resultado**: El texto humanizado aparecerá en el editor derecho

### Atajos de Teclado

| Atajo                      | Acción          |
| -------------------------- | --------------- |
| `Ctrl+Enter` / `Cmd+Enter` | Humanizar texto |
| `Ctrl+D` / `Cmd+D`         | Detectar IA     |
| `Ctrl+K` / `Cmd+K`         | Limpiar todo    |

### Funciones Avanzadas

#### Modo Ghostwriter

1. Haz clic en el botón "Ghostwriter" (👻)
2. Pega un texto de referencia con el estilo que quieres imitar
3. Activa el modo Ghostwriter
4. Humaniza tu texto - imitará el estilo del texto de referencia

#### Comparación de Textos

1. Después de humanizar, haz clic en "Comparar"
2. Verás una vista diff mostrando:
   - 🟢 Verde: Texto añadido
   - 🔴 Rojo: Texto eliminado
   - ⚪ Blanco: Texto sin cambios

#### Historial

1. Haz clic en el icono de historial (📜)
2. Navega por tus trabajos anteriores
3. Haz clic en cualquier elemento para restaurarlo

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
Humanizador-IA/
├── components/           # Componentes React
│   ├── AnalysisDashboard.tsx    # Dashboard de análisis
│   ├── TextEditor.tsx           # Editor de texto
│   ├── Toast.tsx                # Notificaciones
│   ├── HistoryDrawer.tsx        # Panel de historial
│   ├── GhostwriterModal.tsx     # Modal de Ghostwriter
│   └── ProviderSettingsModal.tsx # Configuración de APIs
├── services/            # Lógica de negocio
│   ├── geminiService.ts         # Servicio de Gemini
│   ├── groqService.ts           # Servicio de Groq
│   └── aiService.ts             # Abstracción multi-proveedor
├── types.ts             # Definiciones de TypeScript
├── App.tsx              # Componente principal
└── index.html           # Punto de entrada HTML
```

### Flujo de Datos

```
Usuario → App.tsx → aiService.ts → geminiService/groqService → API
                                                                  ↓
Usuario ← App.tsx ← AnalysisDashboard/TextEditor ← Respuesta ←──┘
```

---

## 🧠 Algoritmo Anti-Detección

### Técnicas Implementadas

Nuestro humanizador utiliza **10 técnicas avanzadas** para engañar a detectores como GPTZero:

#### 1. 🎲 Variación Extrema de Longitud

- Alterna oraciones de 3-5 palabras con oraciones de 25-35 palabras
- Rompe la uniformidad que detectan los algoritmos

#### 2. 💬 Lenguaje Coloquial Forzado

- Reemplaza frases corporativas automáticamente:
  - "es una empresa que" → ELIMINAR
  - "básicamente" → "o sea", "digamos"
  - "a través de" → "con", "mediante"

#### 3. 🚫 100+ Palabras Prohibidas

- Lista exhaustiva de términos que delatan IA
- Incluye conectores robóticos, adjetivos formales, frases corporativas

#### 4. 🎭 Humanización Forzada

- Añade opiniones sutiles ("interesante", "curioso")
- Incluye dudas ("creo que", "me parece")
- Usa preguntas retóricas

#### 5. 📊 Sinónimos Dinámicos

- Máximo 2 repeticiones de palabras técnicas
- Alterna sinónimos genuinos

#### 6. 🔀 Reescritura Radical

- Cambia el orden de las ideas
- No solo reemplaza palabras, reescribe completamente

#### 7. 🎯 Eliminación de Patrones Corporativos

- No usa estructura "X es una Y que Z"
- Evita listas formales predecibles

#### 8. 🌊 Burstiness Extremo

- Alterna párrafos cortos (1-2 oraciones) con largos (5-7 oraciones)

#### 9. 🔍 Auto-Verificación

- El modelo revisa si suena "corporativo"
- Reescribe si detecta patrones formales

#### 10. 💥 Romper Reglas Gramaticales

- Permite fragmentos sin verbo
- Usa puntos suspensivos ocasionalmente
- Empieza oraciones con "Y" o "Pero"

### Parámetros del Modelo

```typescript
{
  temperature: 1.35,  // Máxima creatividad
  topK: 80,           // Mayor variedad de vocabulario
  topP: 0.95          // Diversidad en selección
}
```

### Resultados

| Detector       | Score Antes | Score Después | Mejora  |
| -------------- | ----------- | ------------- | ------- |
| GPTZero        | 100%        | < 20%         | ✅ 80%+ |
| ZeroGPT        | 95%         | < 25%         | ✅ 70%+ |
| Originality.ai | 90%         | < 30%         | ✅ 60%+ |

---

## 🗺️ Roadmap

### ✅ Completado

- [x] Detector de IA con 24+ criterios
- [x] Humanizador con algoritmo anti-GPTZero
- [x] Soporte multi-proveedor (Gemini + Groq)
- [x] Atajos de teclado
- [x] Auto-guardado
- [x] Sistema de notificaciones Toast
- [x] Modo Ghostwriter
- [x] Historial de trabajos
- [x] Comparación de textos

### 🚧 En Progreso

- [ ] Exportación a PDF mejorada
- [ ] Soporte para más idiomas
- [ ] API REST para integración

### 🔮 Futuro

- [ ] Extensión de navegador
- [ ] Integración con Google Docs
- [ ] Modo batch (múltiples textos)
- [ ] Análisis de plagio
- [ ] Soporte para Claude API
- [ ] Modo offline con modelos locales

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar el proyecto:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Reportar Bugs

Si encuentras un bug, por favor [abre un issue](https://github.com/Niconixc/Humanizador-IA/issues) con:

- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots (si aplica)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Google Gemini** - Por proporcionar la API de IA
- **Groq** - Por su infraestructura ultra-rápida
- **Comunidad Open Source** - Por las increíbles librerías utilizadas

---

## 📞 Contacto

**Niconixc** - [@Niconixc](https://github.com/Niconixc)

**Link del Proyecto**: [https://github.com/Niconixc/Humanizador-IA](https://github.com/Niconixc/Humanizador-IA)

**Demo en Vivo**: [https://humanizador-ia.vercel.app](https://humanizador-ia.vercel.app)

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub! ⭐**

Hecho con ❤️ y ☕ por [Niconixc](https://github.com/Niconixc)

</div>
