# Simulador de Duelo - Casa Ravenclaw 🦅📘

Una aplicación web interactiva y responsiva (Mobile First) diseñada para los estudiantes de la Casa Ravenclaw que desean entrenar para el **Club de Duelo de la Federación Mágica Peruana**.

## Características

- 🎯 **10 preguntas dinámicas por sesión:** Cada vez que juegas, se seleccionan 10 hechizos al azar.
- 🧠 **Tres modos de entrenamiento aleatorios:**
  - **Ataque:** Adivinar el contrahechizo correcto.
  - **Mímica de Defensa:** Saber qué movimiento físico hacer al recibir un ataque.
  - **Deducción:** Adivinar qué hechizo te lanzaron basándote en la mímica del rival.
- 🎨 **Diseño Premium y Temático:** Estilo *Glassmorphism*, con colores oficiales de Ravenclaw (Azul profundo, Bronce, Plata) y tipografías mágicas.
- ⚡ **Ultra-ligero:** Construido usando únicamente HTML, CSS y Vanilla JavaScript. Sin dependencias, sin tiempos de compilación.

## ¿Cómo jugar localmente?

Dado que la aplicación es puramente estática (Vanilla JS), puedes probarla localmente de manera muy sencilla:

1. Clona o descarga este repositorio.
2. Abre la carpeta del proyecto.
3. Puedes usar cualquier servidor local (como la extensión *Live Server* de VS Code, o corriendo `npx http-server` en la terminal).
4. Abre `index.html` en tu navegador. 
*(Nota: Debido a políticas de CORS del navegador, si abres el archivo directamente dando doble clic `file:///...`, el `fetch` del archivo `data.json` podría ser bloqueado. Por eso se recomienda usar un pequeño servidor local).*

## Guía de Despliegue Gratuito 🚀

Puedes alojar este proyecto de forma gratuita en múltiples plataformas. Al no requerir un entorno de Node.js en producción, el proceso toma menos de 2 minutos.

### Opción 1: Vercel (Recomendado)
1. Sube tu código a un repositorio en **GitHub**.
2. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New..."** -> **"Project"**.
4. Importa el repositorio de tu "Simulador de Duelo".
5. Vercel detectará automáticamente que es un sitio estático. No necesitas cambiar ninguna configuración.
6. Haz clic en **"Deploy"**. ¡En segundos tendrás un enlace público!

### Opción 2: Netlify
1. Ve a [Netlify](https://www.netlify.com/) e inicia sesión.
2. Ve a la pestaña **Sites** y haz clic en **"Add new site"** -> **"Import an existing project"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio.
4. Deja los comandos de "Build" en blanco (es un sitio estático).
5. Haz clic en **"Deploy site"**.

### Opción 3: GitHub Pages
1. Sube los archivos a un repositorio público en GitHub.
2. Ve a la pestaña **"Settings"** de tu repositorio.
3. En el menú lateral izquierdo, haz clic en **"Pages"**.
4. Bajo **"Source"** (o "Build and deployment"), selecciona "Deploy from a branch".
5. Selecciona la rama `main` (o `master`) y la carpeta `/(root)`.
6. Haz clic en **"Save"**.
7. ¡Listo! Arriba aparecerá el enlace a tu aplicación en vivo.

---
*"El ingenio sin medida es el mayor tesoro del hombre."* - Rowena Ravenclaw
