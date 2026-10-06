---
paths:
  - 'resources/js/**'
---

# Js

## Diseño responsive primero
Diseñar cada vista primero para móvil y ampliarla progresivamente para tablet y escritorio. Evitar scroll horizontal, mantener áreas táctiles cómodas, estados focus visibles y usar componentes compartidos para navegación, botones y layouts. Verificar cambios visuales en móvil, tablet y escritorio.

## Tema, paleta y semántica visual
- Toda pantalla del portal, incluyendo páginas públicas, debe respetar `branding.theme`: `light`, `dark` y `system`. `system` debe seguir la preferencia del dispositivo en ambos esquemas; no fijar el tema a partir de clases claras/oscuras del sistema operativo.
- Preferir tokens/clases semánticas compartidas (`theme-page`, `theme-card`, `theme-content`, `theme-content-secondary`, `theme-content-muted`, `theme-outline`, `theme-accent-button`, `theme-info`, `theme-success`, `theme-warning`, `theme-danger`) sobre pares de colores utilitarios acoplados como `bg-blue-50 text-blue-900`. Los tokens de estado definen superficie, borde y foreground coordinados; no añadir encima un texto de otra paleta.
- Usar el acento de marca para navegación, acciones primarias, foco e indicadores interactivos. Usar info/success/warning/danger solo por significado de estado. No cambiar los colores codificados clínicamente del odontograma (severidad/condición): deben seguir representando los mismos datos y conservar contraste en ambos temas.
- Evitar colores de texto/background/border hard-coded, fondos `bg-white`/`bg-slate-50` y `dark:` aislados en nuevas vistas; usar los tokens del portal. Corregir también hover, focus-visible, disabled, errores, overlays, tablas, inputs, checkboxes, badges y popovers para que no creen combinaciones de bajo contraste. Nunca fuerces texto negro sobre fondo oscuro en hover.
- En contenido externo al layout autenticado, pasar el tema y branding y establecer explícitamente `data-theme`/`data-variant`. Las vistas de impresión son la excepción: optimizar para papel claro en `@media print`, independientemente del tema de pantalla.
- Al modificar UI, revisar las variantes `light`, `dark` y `system` (simulando sistema claro y oscuro), en móvil y escritorio; comprobar contraste legible, estados de teclado y la ausencia de estilos fijos que contradigan el tema.
